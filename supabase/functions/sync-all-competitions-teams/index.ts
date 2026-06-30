// /supabase/functions/sync_teams/index.ts
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
/** ---------- Config ---------- */ const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};
const FD_BASE = "https://api.football-data.org/v4";
const COMPETITIONS = [
  {
    name: "Premier League",
    code: "PL"
  },
  {
    name: "La Liga",
    code: "PD"
  },
  {
    name: "Serie A",
    code: "SA"
  },
  {
    name: "Bundesliga",
    code: "BL1"
  },
  {
    name: "Ligue 1",
    code: "FL1"
  }
];
const TEAMS_BUCKET = "teams_logo";
const BULK_CHUNK = 500; // upsert chunk size
const FETCH_TIMEOUT_MS = 15000;
/** ---------- Utils ---------- */ const must = (k)=>{
  const v = Deno.env.get(k);
  if (!v) throw new Error(`${k} is not set`);
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
async function timedFetch(url, init, timeoutMs = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const to = setTimeout(()=>ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal
    });
  } finally{
    clearTimeout(to);
  }
}
/** Infer file extension from CT/URL */ function inferExtFromContentType(ct) {
  if (!ct) return "png";
  const l = ct.toLowerCase();
  if (l.includes("svg")) return "svg";
  if (l.includes("webp")) return "webp";
  if (l.includes("jpeg")) return "jpg";
  if (l.includes("png")) return "png";
  return "png";
}
function inferExtFromUrl(url) {
  const m = url.toLowerCase().match(/\.(svg|png|webp|jpe?g)(?:\?|#|$)/);
  return m?.[1] ?? null;
}
async function downloadImage(url) {
  const res = await timedFetch(url);
  if (!res.ok) throw new Error(`Logo download ${res.status}: ${url}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const ct = res.headers.get("content-type") ?? undefined;
  const ext = inferExtFromUrl(url) ?? inferExtFromContentType(ct);
  return {
    buf,
    contentType: ct ?? "application/octet-stream",
    ext
  };
}
async function uploadToBucket(supabase, bucket, keyNoExt, payload) {
  const path = `${keyNoExt}.${payload.ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, payload.buf, {
    contentType: payload.contentType,
    upsert: true,
    cacheControl: "31536000"
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
function mapTeam(t, logoUrl) {
  const now = new Date().toISOString();
  return {
    id: t.id,
    name: t.name ?? null,
    shortName: t.shortName ?? null,
    tla: t.tla ?? null,
    logo: logoUrl,
    venue: t.venue ?? null,
    updated_at: now
  };
}
/** ---------- Main handler ---------- */ Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: CORS_HEADERS
  });
  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    // 1) Fetch teams for all competitions in parallel (with retry/timeout)
    const fetches = await Promise.allSettled(COMPETITIONS.map(async (c)=>{
      const url = `${FD_BASE}/competitions/${c.code}/teams`;
      const res = await retry(async ()=>{
        const r = await timedFetch(url, {
          headers: {
            "X-Auth-Token": FD_KEY,
            Accept: "application/json"
          }
        });
        if (!r.ok) throw new Error(`FD API ${r.status}: ${await r.text()}`);
        return r.json();
      });
      const teams = Array.isArray(res?.teams) ? res.teams : [];
      console.info(`${c.code}: Found ${teams.length} teams`);
      return teams;
    }));
    // 2) Dedupe teams (same team won’t be inserted twice if it appears in multiple calls)
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
    console.info(`Total unique teams collected: ${rawTeams.length}`);
    if (rawTeams.length === 0) {
      return new Response(JSON.stringify({
        success: fetchErrors.length === 0,
        synced: 0,
        uploadedLogos: 0,
        errors: fetchErrors.length ? {
          fetch: fetchErrors
        } : undefined
      }), {
        headers: CORS_HEADERS
      });
    }
    // 3) Download & upload crests (best-effort; don’t fail whole job on a single bad image)
    let uploadedLogos = 0;
    const mappedTeams = [];
    for (const t of rawTeams){
      let logoUrl = null;
      try {
        if (t.crest) {
          const a = await downloadImage(t.crest);
          logoUrl = await uploadToBucket(supabase, TEAMS_BUCKET, String(t.id), a);
          uploadedLogos++;
        }
      } catch (e) {
        console.error(`Logo upload failed for team ${t?.shortName ?? t?.name ?? t?.id}:`, e);
      }
      mappedTeams.push(mapTeam(t, logoUrl));
    }
    // 4) Bulk upsert teams into DB (chunks)
    let synced = 0;
    const dbErrors = [];
    for(let i = 0; i < mappedTeams.length; i += BULK_CHUNK){
      const slice = mappedTeams.slice(i, i + BULK_CHUNK);
      try {
        // Ask for ids back so we can count reliably (count may be null on upsert)
        const resp = await supabase.from("teams").upsert(slice, {
          onConflict: "id"
        }).select("id");
        if (resp && "error" in resp && resp.error) {
          console.error("Teams bulk upsert error:", resp.error);
          dbErrors.push(resp.error?.message ?? String(resp.error));
        } else {
          const c = Array.isArray(resp?.data) ? resp.data.length : slice.length;
          synced += c;
        }
      } catch (e) {
        dbErrors.push(e instanceof Error ? e.message : String(e));
        console.error("Teams bulk upsert threw:", e);
      }
    }
    const body = {
      success: fetchErrors.length === 0 && dbErrors.length === 0,
      synced,
      uploadedLogos,
      totalCollected: rawTeams.length,
      errors: fetchErrors.length || dbErrors.length ? {
        fetch: fetchErrors.length ? fetchErrors : undefined,
        db: dbErrors.length ? dbErrors : undefined
      } : undefined
    };
    console.info(`✅ Synced ${synced} teams, uploaded ${uploadedLogos} logos`);
    return new Response(JSON.stringify(body), {
      headers: CORS_HEADERS
    });
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const reqId = crypto.randomUUID();
    console.error("❌ Competition sync failed:", {
      reqId,
      message: e.message,
      stack: e.stack
    });
    return new Response(JSON.stringify({
      success: false,
      reqId,
      message: e.message
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
});
