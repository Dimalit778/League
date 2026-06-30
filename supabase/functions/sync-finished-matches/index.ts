// sync-finished-matches
// Daily sync of all matches for leagues + Champions League.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@2";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};
const FD_BASE_URL = "https://api.football-data.org/v4";
const COMPETITIONS = [
  "PL",
  "PD",
  "SA",
  "BL1",
  "FL1",
  "CL"
];
const getEnvVar = (key)=>{
  const v = Deno.env.get(key);
  if (!v) throw new Error(`${key} environment variable is not set`);
  return v;
};
const sleep = (ms)=>new Promise((r)=>setTimeout(r, ms));
async function retry(fn, retries = 2, baseDelayMs = 300) {
  let i = 0;
  while(true){
    try {
      return await fn();
    } catch (e) {
      if (i++ >= retries) throw e;
      await sleep(baseDelayMs * 2 ** (i - 1));
    }
  }
}
async function fetchFootballData(url, apiKey) {
  return retry(async ()=>{
    const ctrl = new AbortController();
    const to = setTimeout(()=>ctrl.abort(), 15_000);
    try {
      const res = await fetch(url, {
        headers: {
          "X-Auth-Token": apiKey,
          Accept: "application/json"
        },
        signal: ctrl.signal
      });
      if (!res.ok) throw new Error(`FD API error (${res.status}): ${await res.text()}`);
      return res.json();
    } finally{
      clearTimeout(to);
    }
  });
}
const transformMatch = (m)=>({
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
      winner: m?.score?.winner ?? null,
      duration: m?.score?.duration ?? null,
      fullTime: {
        home: m?.score?.fullTime?.home ?? null,
        away: m?.score?.fullTime?.away ?? null
      },
      halfTime: {
        home: m?.score?.halfTime?.home ?? null,
        away: m?.score?.halfTime?.away ?? null
      }
    },
    referee: m?.referees?.[0]?.name ?? null,
    updated_at: new Date().toISOString()
  });
async function bulkUpsertMatches(supabase, rows, chunkSize = 500) {
  let updated = 0;
  const errors = [];
  for(let i = 0; i < rows.length; i += chunkSize){
    const slice = rows.slice(i, i + chunkSize);
    try {
      const resp = await supabase.from("matches").upsert(slice, {
        onConflict: "id"
      }).select("id");
      if (resp?.error) {
        errors.push({
          start: i,
          message: resp.error.message
        });
        console.error("Upsert error:", resp.error.message);
      } else {
        updated += Array.isArray(resp?.data) ? resp.data.length : slice.length;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({
        start: i,
        message: msg
      });
      console.error("Upsert threw:", msg);
    }
  }
  return {
    updated,
    errors
  };
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: CORS_HEADERS
  });
  try {
    const SUPABASE_URL = getEnvVar("SUPABASE_URL");
    const SERVICE_ROLE = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = getEnvVar("FOOTBALL_ORG_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    console.info(`Syncing matches for: ${COMPETITIONS.join(", ")}`);
    const results = await Promise.allSettled(COMPETITIONS.map(async (code)=>{
      const payload = await fetchFootballData(`${FD_BASE_URL}/competitions/${code}/matches`, FD_KEY);
      const matches = Array.isArray(payload?.matches) ? payload.matches : [];
      console.info(`${code}: ${matches.length} matches`);
      return matches;
    }));
    const allMatches = [];
    const fetchErrors = [];
    for (const r of results){
      if (r.status === "fulfilled") allMatches.push(...r.value);
      else fetchErrors.push(r.reason instanceof Error ? r.reason.message : String(r.reason));
    }
    const rows = allMatches.filter((m)=>m?.id).map(transformMatch);
    const { updated, errors: upsertErrors } = await bulkUpsertMatches(supabase, rows);
    const allErrors = [
      ...fetchErrors,
      ...upsertErrors.map((e)=>e.message)
    ];
    return new Response(JSON.stringify({
      success: allErrors.length === 0,
      updated,
      totalFetched: rows.length,
      errors: allErrors.length > 0 ? allErrors : undefined
    }), {
      headers: CORS_HEADERS
    });
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const reqId = crypto.randomUUID();
    console.error("sync-finished-matches error:", {
      reqId,
      message: e.message
    });
    return new Response(JSON.stringify({
      success: false,
      reqId,
      message: e.message
    }), {
      status: 500,
      headers: {
        ...CORS_HEADERS,
        "x-error-id": reqId
      }
    });
  }
});
