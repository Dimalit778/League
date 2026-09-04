// v2_start-worldcup-sync
// Syncs competition, teams, and matches for FIFA World Cup.
// Run once every 4 years at the start of the tournament.
// Order: competition → teams → matches (required by FK constraints)
import {
  createServiceClient,
  errorResponse,
  FD_BASE,
  fdFetch,
  jsonResponse,
  lockedResponse,
  must,
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";
import { upsertCurrentSeason } from "../_shared/seasons.ts";
import { describeError, logException } from "../_shared/monitoring.ts";
import {
  logRejectedMatches,
  mapFootballMatches,
} from "../_shared/footballMatches.ts";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};
const JOB = "v2-start-worldcup-sync";
const WC_CODE = "WC";
const WC_NAME = "FIFA World Cup";
// Statuses that mean the match has NOT kicked off yet
const UNSTARTED = new Set([
  "SCHEDULED",
  "TIMED"
]);
const STAGE_ORDER = [
  "PRELIMINARY_ROUND",
  "QUALIFICATION_ROUND_1",
  "QUALIFICATION_ROUND_2",
  "QUALIFICATION_ROUND_3",
  "PLAYOFF_ROUND_1",
  "PLAYOFF_ROUND_2",
  "PLAYOFFS",
  "GROUP_STAGE",
  "LAST_64",
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL"
];
const CHUNK_SIZE = 500;
// ─── Utils ────────────────────────────────────────────────────────────────────
const nowIso = ()=>new Date().toISOString();
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
async function tryUpload(supabase, bucket, path, imageUrl, label) {
  try {
    const file = await downloadImage(imageUrl);
    const fullPath = `${path}.${file.ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fullPath, file.buf, {
      contentType: file.contentType,
      upsert: true,
      cacheControl: "31536000"
    });
    if (error) throw new Error(error.message);
    return supabase.storage.from(bucket).getPublicUrl(fullPath).data.publicUrl;
  } catch (e) {
    logException(JOB, e, { operation: "storage.image_upload", asset: label });
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
      const details = describeError(error);
      errors.push(`${details.errorCode ?? "DB_ERROR"} ${details.errorMessage}`);
      logException(JOB, error, { operation: `${table}.bulk_upsert`, rowCount: part.length });
    } else count += data?.length ?? part.length;
  }
  return {
    count,
    errors
  };
}
/**
 * Derives the current stage and matchday from match data.
 *
 * Logic:
 * 1. Filter to only TRULY started matches (exclude SCHEDULED + TIMED).
 * 2. If none have started → tournament hasn't begun → return the EARLIEST
 *    stage from STAGE_ORDER that appears in the schedule.
 * 3. If some have started → find the LATEST stage that has at least one
 *    started match (walk STAGE_ORDER forwards, keep overwriting).
 * 4. current_matchday is only relevant during GROUP_STAGE.
 */ function deriveCupProgress(matches) {
  // Only matches that have actually kicked off
  const started = matches.filter((m)=>!UNSTARTED.has(m?.status));
  // ── Tournament hasn't started yet ──────────────────────────────────────────
  if (started.length === 0) {
    const scheduledStages = new Set(matches.map((m)=>m?.stage).filter(Boolean));
    for (const s of STAGE_ORDER){
      if (scheduledStages.has(s)) {
        return {
          current_stage: s,
          current_matchday: s === "GROUP_STAGE" ? 1 : null
        };
      }
    }
    return {
      current_stage: null,
      current_matchday: null
    };
  }
  // ── Tournament in progress ─────────────────────────────────────────────────
  const activeStages = new Set(started.map((m)=>m?.stage).filter(Boolean));
  let current_stage = null;
  for (const s of STAGE_ORDER){
    if (activeStages.has(s)) current_stage = s;
  }
  // Fallback for unknown stages not in STAGE_ORDER
  if (!current_stage && started.length > 0) {
    current_stage = started[started.length - 1]?.stage ?? null;
  }
  let current_matchday = null;
  if (current_stage === "GROUP_STAGE") {
    const played = started.filter((m)=>m?.stage === "GROUP_STAGE" && typeof m?.matchday === "number").map((m)=>m.matchday);
    current_matchday = played.length > 0 ? Math.max(...played) : 1;
  }
  return {
    current_stage,
    current_matchday
  };
}
// ─── Step 1: Sync competition ────────────────────────────────────────────────
async function syncCompetition(supabase, fdKey, matches) {
  console.info("🏆 Step 1: Syncing World Cup competition...");
  const apiComp = await fdFetch(supabase, JOB, `${FD_BASE}/competitions/${WC_CODE}`, fdKey);
  const season = apiComp.currentSeason ?? null;
  const progress = deriveCupProgress(matches);
  const groupMatchdays = new Set();
  for (const match of matches) {
    if (match?.stage === "GROUP_STAGE" && typeof match?.matchday === "number") {
      groupMatchdays.add(match.matchday);
    }
  }
  const totalMatchdays = groupMatchdays.size;
  console.info(`📊 Progress: stage=${progress.current_stage}, matchday=${progress.current_matchday}, totalMatchdays=${totalMatchdays}`);
  const flag = apiComp.area?.flag
    ? await tryUpload(supabase, "flags", apiComp.area.code ?? "World", apiComp.area.flag, "WC flag")
    : null;
  const row = {
    id: apiComp.id,
    name: WC_NAME,
    code: WC_CODE,
    type: apiComp.type ?? "CUP",
    flag,
    area: apiComp.area?.name ?? null,
    updated_at: nowIso()
  };
  const { error } = await supabase.from("competitions").upsert(row, {
    onConflict: "id"
  });
  if (error) throw new Error(`Competition upsert failed: ${error.message}`);

  if (season?.id) {
    await upsertCurrentSeason(supabase, {
      id: season.id,
      competition_id: apiComp.id,
      season_start: season.startDate ?? null,
      season_end: season.endDate ?? null,
      current_matchday: progress.current_matchday,
      current_stage: progress.current_stage,
      total_matchdays: totalMatchdays,
    });
  }
  console.info(`✅ World Cup competition synced (id: ${apiComp.id})`);
  return {
    id: apiComp.id
  };
}
// ─── Step 2: Sync teams ───────────────────────────────────────────────────────
async function syncTeams(supabase, fdKey) {
  console.info("⚽ Step 2: Syncing World Cup teams...");
  const payload = await fdFetch(supabase, JOB, `${FD_BASE}/competitions/${WC_CODE}/teams`, fdKey);
  const rawTeams = Array.isArray(payload?.teams) ? payload.teams : [];
  console.info(`Found ${rawTeams.length} teams`);
  const mappedTeams = rawTeams.map((t)=>({
      id: t.id,
      name: t.name ?? null,
      shortName: t.shortName ?? null,
      tla: t.tla ?? null,
      venue: t.venue ?? null,
      clubColors: t.clubColors ?? null,
      updated_at: nowIso()
    }));
  const { count, errors } = await bulkUpsert(supabase, "teams", mappedTeams);
  console.info(`✅ Teams synced: ${count}`);
  return {
    count,
    errors
  };
}
// ─── Step 3: Sync matches ─────────────────────────────────────────────────────
async function syncMatches(supabase, matches) {
  console.info("🗓️ Step 3: Syncing World Cup matches...");
  const { rows, rejected } = mapFootballMatches(matches, { updatedAt: "now" });
  logRejectedMatches(JOB, rejected);
  const { count, errors } = await bulkUpsert(supabase, "matches", rows);
  if (rejected.length > 0) errors.push(`${rejected.length} match payload(s) rejected`);
  console.info(`✅ Matches synced: ${count}`);
  return {
    count,
    errors
  };
}
// ─── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: CORS_HEADERS
  });
  if (req.method !== "POST") return jsonResponse({ success: false, message: "Method not allowed" }, 405);
  const denied = requireSyncAuth(req);
  if (denied) return denied;
  try {
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");
    const supabase = createServiceClient();
    if (!(await tryAcquireSyncLock(supabase, JOB, 3600))) return lockedResponse(JOB);

    try {
      console.info("🚀 World Cup sync started");
      // Fetch matches once — reused by both syncCompetition and syncMatches
      const matchPayload = await fdFetch(supabase, JOB, `${FD_BASE}/competitions/${WC_CODE}/matches`, FD_KEY);
    const matches = Array.isArray(matchPayload?.matches) ? matchPayload.matches : [];
    console.info(`Fetched ${matches.length} World Cup matches`);
    // Step 1: competition (FK anchor for teams + matches)
    await syncCompetition(supabase, FD_KEY, matches);
    // Step 2: teams (FK anchor for matches)
    const { count: teamsCount, errors: teamErrors } = await syncTeams(supabase, FD_KEY);
    // Step 3: matches
    const { count: matchesCount, errors: matchErrors } = await syncMatches(supabase, matches);
    const allErrors = [
      ...teamErrors,
      ...matchErrors
    ];
    await releaseSyncLock(supabase, JOB, allErrors.length === 0 ? "success" : "partial");
    console.info(`✅ World Cup sync complete — teams: ${teamsCount}, matches: ${matchesCount}`);
    return new Response(JSON.stringify({
      success: allErrors.length === 0,
      teams: teamsCount,
      matches: matchesCount,
      errors: allErrors.length > 0 ? allErrors : undefined
    }), {
      headers: CORS_HEADERS
    });
    } catch (error) {
      await releaseSyncLock(supabase, JOB, "error");
      throw error;
    }
  } catch (e) {
    return errorResponse(JOB, e);
  }
});
