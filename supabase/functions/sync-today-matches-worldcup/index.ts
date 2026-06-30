// sync-today-matches-worldcup
// Syncs today's World Cup matches.
import { createClient } from "npm:@supabase/supabase-js@2";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};
const FD_BASE = "https://api.football-data.org/v4";
const WC_CODE = "WC";
const must = (key)=>{
  const v = Deno.env.get(key);
  if (!v) throw new Error(`${key} is not set`);
  return v;
};
const nowIso = ()=>new Date().toISOString();
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
    updated_at: nowIso()
  });
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: CORS_HEADERS
  });
  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    // /matches endpoint filtered to WC — returns only today's matches
    const res = await fetch(`${FD_BASE}/matches?competitions=${WC_CODE}`, {
      headers: {
        "X-Auth-Token": FD_KEY,
        Accept: "application/json"
      }
    });
    if (!res.ok) throw new Error(`FD API ${res.status}: ${await res.text()}`);
    const payload = await res.json();
    const matches = Array.isArray(payload?.matches) ? payload.matches : [];
    console.info(`Today's WC matches: ${matches.length}`);
    if (matches.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        updated: 0,
        message: "No WC matches today"
      }), {
        headers: CORS_HEADERS
      });
    }
    const rows = matches.filter((m)=>m?.id).map(transformMatch);
    const { data, error } = await supabase.from("matches").upsert(rows, {
      onConflict: "id"
    }).select("id");
    if (error) throw new Error(`Upsert failed: ${error.message}`);
    const updated = data?.length ?? rows.length;
    console.info(`Updated ${updated} WC matches`);
    return new Response(JSON.stringify({
      success: true,
      updated,
      totalFetched: rows.length
    }), {
      headers: CORS_HEADERS
    });
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const reqId = crypto.randomUUID();
    console.error("sync-today-matches-worldcup error:", {
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
      headers: {
        ...CORS_HEADERS,
        "x-error-id": reqId
      }
    });
  }
});
