// v2_start-season-sync-all
// Syncs competitions, teams, and matches for all 5 leagues + Champions League.
// Run once at the start of each season.
// Order: competitions → teams → matches (required by FK constraints)
import { createClient } from "npm:@supabase/supabase-js@2";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};
const FD_BASE = "https://api.football-data.org/v4";
const LEAGUE_COMPETITIONS = [
  {
    name: "Premier League",
    code: "PL",
    type: "LEAGUE"
  },
  {
    name: "La Liga",
    code: "PD",
    type: "LEAGUE"
  }
];
// Stage order for CUP competitions (earliest → latest)
const STAGE_ORDER = [
  "PRELIMINARY_ROUND",
  "QUALIFICATION_ROUND_1",
  "QUALIFICATION_ROUND_2",
  "QUALIFICATION_ROUND_3",
  "PLAYOFF_ROUND_1",
  "PLAYOFF_ROUND_2",
  "PLAYOFFS",
  "GROUP_STAGE",
  "LEAGUE_STAGE",
  "LAST_64",
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL"
];
const CHUNK_SIZE = 500;
const FETCH_TIMEOUT_MS = 20_000;
const TEAMS_BUCKET = "teams_logo";
const FLAGS_BUCKET = "flags";
const COMPETITIONS_LOGO_BUCKET = "competitions_logo";
// ─── Utils ────────────────────────────────────────────────────────────────────
const nowIso = ()=>new Date().toISOString();
const must = (key)=>{
  const v = Deno.env.get(key);
  if (!v) throw new Error(`${key} is not set`);
  return v;
};
const sleep = (ms)=>new Promise((r)=>setTimeout(r, ms));
async function retry(fn, retries = 2, baseDelay = 300) {
  let i = 0;
  while(true){
    try {
      return await fn();
    } catch (e) {
      if (i++ >= retries) throw e;
      await sleep(baseDelay * 2 ** (i - 1));
    }
  }
}
async function fdFetch(url, fdKey) {
  return retry(async ()=>{
    const ctrl = new AbortController();
    const to = setTimeout(()=>ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: {
          "X-Auth-Token": fdKey,
          Accept: "application/json"
        },
        signal: ctrl.signal
      });
      if (!res.ok) throw new Error(`FD API ${res.status}: ${await res.text()}`);
      return res.json();
    } finally{
      clearTimeout(to);
    }
  });
}
function inferExt(url, ct) {
  const fromUrl = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/)?.[1];
  if (fromUrl) return fromUrl;
  if (ct?.includes("svg")) return "svg";
  if (ct?.includes("webp")) return "webp";
  if (ct?.includes("jpeg")) return "jpg";
  return "png";
}
async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed ${res.status}: ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const ct = res.headers.get("content-type");
  return {
    buf,
    contentType: ct ?? "application/octet-stream",
    ext: inferExt(url, ct)
  };
}
async function uploadToBucket(supabase, bucket, pathNoExt, payload) {
  const path = `${pathNoExt}.${payload.ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, payload.buf, {
    contentType: payload.contentType,
    upsert: true,
    cacheControl: "31536000"
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
async function tryUpload(supabase, bucket, path, imageUrl, label) {
  try {
    const file = await downloadImage(imageUrl);
    return await uploadToBucket(supabase, bucket, path, file);
  } catch (e) {
    console.warn(`⚠️ Failed to upload ${label}:`, e);
    return null;
  }
}
function chunk(arr, size) {
  const out = [];
  for(let i = 0; i < arr.length; i += size)out.push(arr.slice(i, i + size));
  return out;
}
async function bulkUpsert(supabase, table, rows) {
  let count = 0;
  const errors = [];
  for (const part of chunk(rows, CHUNK_SIZE)){
    const { data, error } = await supabase.from(table).upsert(part, {
      onConflict: "id"
    }).select("id");
    if (error) {
      errors.push(error.message);
      console.error(`Upsert error (${table}):`, error.message);
    } else count += data?.length ?? part.length;
  }
  return {
    count,
    errors
  };
}
// ─── Cup progress ─────────────────────────────────────────────────────────────
function deriveCupProgress(matches) {
  const started = matches.filter((m)=>m?.status !== "SCHEDULED");
  const pool = started.length > 0 ? started : matches;
  const activeStages = new Set(pool.map((m)=>m?.stage).filter(Boolean));
  let current_stage = null;
  for (const s of STAGE_ORDER){
    if (activeStages.has(s)) current_stage = s;
  }
  // fallback for unknown stages not in STAGE_ORDER
  if (!current_stage && pool.length > 0) {
    current_stage = pool[pool.length - 1]?.stage ?? null;
  }
  let current_fixture = null;
  const groupStage = current_stage === "GROUP_STAGE" || current_stage === "LEAGUE_STAGE";
  if (groupStage) {
    const played = started.filter((m)=>m?.stage === current_stage && typeof m?.matchday === "number").map((m)=>m.matchday);
    current_fixture = played.length > 0 ? Math.max(...played) : 1;
  }
  return {
    current_stage,
    current_fixture
  };
}
// ─── Step 1: Sync competitions ────────────────────────────────────────────────
async function syncCompetitions(supabase, fdKey) {
  console.info("🏆 Step 1: Syncing competitions...");
  const competitionIds = new Map(); // code → id
  const errors = [];
  await Promise.allSettled(LEAGUE_COMPETITIONS.map(async (comp)=>{
    try {
      const apiComp = await fdFetch(`${FD_BASE}/competitions/${comp.code}`, fdKey);
      const season = apiComp.currentSeason ?? null;
      const isCup = comp.type === "CUP";
      const [logo, flag] = await Promise.all([
        apiComp.emblem ? tryUpload(supabase, COMPETITIONS_LOGO_BUCKET, comp.code, apiComp.emblem, `${comp.code} emblem`) : Promise.resolve(null),
        apiComp.area?.flag ? tryUpload(supabase, FLAGS_BUCKET, apiComp.area.code ?? apiComp.area.name, apiComp.area.flag, `${comp.code} flag`) : Promise.resolve(null)
      ]);
      let current_stage = null;
      let current_fixture = null;
      let total_fixtures = null;
      if (isCup) {
        const matchPayload = await fdFetch(`${FD_BASE}/competitions/${comp.code}/matches`, fdKey);
        const matches = Array.isArray(matchPayload?.matches) ? matchPayload.matches : [];
        const progress = deriveCupProgress(matches);
        current_stage = progress.current_stage;
        current_fixture = progress.current_fixture;
        total_fixtures = matches.length;
      } else {
        current_fixture = season?.currentMatchday ?? null;
        // Count distinct matchdays for total_fixtures
        const matchPayload = await fdFetch(`${FD_BASE}/competitions/${comp.code}/matches`, fdKey);
        const matches = Array.isArray(matchPayload?.matches) ? matchPayload.matches : [];
        const matchdays = new Set(matches.map((m)=>m?.matchday).filter((d)=>typeof d === "number"));
        total_fixtures = matchdays.size > 0 ? matchdays.size : null;
      }
      const row = {
        id: apiComp.id,
        name: comp.name,
        code: comp.code,
        type: apiComp.type ?? comp.type,
        logo,
        flag,
        area: apiComp.area?.name ?? null,
        season_id: season?.id ?? null,
        season_start: season?.startDate ?? null,
        season_end: season?.endDate ?? null,
        current_fixture: isCup ? current_fixture : current_fixture,
        current_stage: isCup ? current_stage : null,
        total_fixtures,
        updated_at: nowIso()
      };
      const { error } = await supabase.from("competitions").upsert(row, {
        onConflict: "id"
      });
      if (error) throw new Error(error.message);
      competitionIds.set(comp.code, apiComp.id);
      console.info(`✅ Competition synced: ${comp.code}`);
    } catch (e) {
      const msg = `${comp.code}: ${e instanceof Error ? e.message : String(e)}`;
      errors.push(msg);
      console.error(`❌ Competition sync failed: ${msg}`);
    }
  }));
  return {
    competitionIds,
    errors
  };
}
// ─── Step 2: Sync teams ───────────────────────────────────────────────────────
async function syncTeams(supabase, fdKey) {
  console.info("⚽ Step 2: Syncing teams...");
  const fetches = await Promise.allSettled(LEAGUE_COMPETITIONS.map(async (comp)=>{
    const payload = await fdFetch(`${FD_BASE}/competitions/${comp.code}/teams`, fdKey);
    return Array.isArray(payload?.teams) ? payload.teams : [];
  }));
  const teamsById = new Map();
  const fetchErrors = [];
  for (const r of fetches){
    if (r.status === "fulfilled") {
      for (const t of r.value){
        if (t?.id && !teamsById.has(t.id)) teamsById.set(t.id, t);
      }
    } else {
      fetchErrors.push(r.reason instanceof Error ? r.reason.message : String(r.reason));
    }
  }
  const rawTeams = Array.from(teamsById.values());
  console.info(`Found ${rawTeams.length} unique teams`);
  // Upload logos in parallel (best-effort)
  const mappedTeams = await Promise.all(rawTeams.map(async (t)=>{
    const logo = t.crest ? await tryUpload(supabase, TEAMS_BUCKET, String(t.id), t.crest, `team ${t.id}`) : null;
    return {
      id: t.id,
      name: t.name ?? null,
      shortName: t.shortName ?? null,
      tla: t.tla ?? null,
      logo,
      venue: t.venue ?? null,
      clubColors: t.clubColors ?? null,
      updated_at: nowIso()
    };
  }));
  const { count, errors } = await bulkUpsert(supabase, "teams", mappedTeams);
  console.info(`✅ Teams synced: ${count}`);
  return {
    count,
    errors: [
      ...fetchErrors,
      ...errors
    ]
  };
}
// ─── Step 3: Sync matches ─────────────────────────────────────────────────────
async function syncMatches(supabase, fdKey) {
  console.info("🗓️ Step 3: Syncing matches...");
  const fetches = await Promise.allSettled(LEAGUE_COMPETITIONS.map(async (comp)=>{
    const payload = await fdFetch(`${FD_BASE}/competitions/${comp.code}/matches`, fdKey);
    return Array.isArray(payload?.matches) ? payload.matches : [];
  }));
  const allMatches = [];
  const fetchErrors = [];
  for (const r of fetches){
    if (r.status === "fulfilled") allMatches.push(...r.value);
    else fetchErrors.push(r.reason instanceof Error ? r.reason.message : String(r.reason));
  }
  const rows = allMatches.filter((m)=>m?.id).map((m)=>({
      id: m.id,
      competition_id: m.competition?.id ?? null,
      fixture: m.matchday ?? null,
      kick_off: m.utcDate ?? null,
      status: m.status ?? null,
      stage: m.stage ?? null,
      group: m.group ?? null,
      home_team_id: m.homeTeam?.id ?? null,
      away_team_id: m.awayTeam?.id ?? null,
      score: {
        winner: m.score?.winner ?? null,
        duration: m.score?.duration ?? null,
        fullTime: {
          home: m.score?.fullTime?.home ?? null,
          away: m.score?.fullTime?.away ?? null
        },
        halfTime: {
          home: m.score?.halfTime?.home ?? null,
          away: m.score?.halfTime?.away ?? null
        }
      },
      referee: m.referees?.[0]?.name ?? null,
      updated_at: nowIso()
    }));
  const { count, errors } = await bulkUpsert(supabase, "matches", rows);
  console.info(`✅ Matches synced: ${count}`);
  return {
    count,
    errors: [
      ...fetchErrors,
      ...errors
    ]
  };
}
// ─── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: CORS_HEADERS
  });
  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    console.info("🚀 v2 season sync started");
    // Step 1: competitions (must be first — teams + matches FK depend on it)
    const { errors: compErrors } = await syncCompetitions(supabase, FD_KEY);
    // Step 2: teams (must be before matches — matches.home/away_team_id FK)
    const { count: teamsCount, errors: teamErrors } = await syncTeams(supabase, FD_KEY);
    // Step 3: matches
    const { count: matchesCount, errors: matchErrors } = await syncMatches(supabase, FD_KEY);
    const allErrors = [
      ...compErrors,
      ...teamErrors,
      ...matchErrors
    ];
    console.info(`✅ v2 season sync complete — teams: ${teamsCount}, matches: ${matchesCount}`);
    return new Response(JSON.stringify({
      success: allErrors.length === 0,
      teams: teamsCount,
      matches: matchesCount,
      errors: allErrors.length > 0 ? allErrors : undefined
    }), {
      headers: CORS_HEADERS
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("❌ v2 season sync failed:", err.message);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
});
