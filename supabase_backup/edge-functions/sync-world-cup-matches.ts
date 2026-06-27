import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

const FD_BASE = "https://api.football-data.org/v4";
const WORLD_CUP_COMPETITION = "WC";

const nowIso = () => new Date().toISOString();

const must = (k: string) => {
  const v = Deno.env.get(k);

  if (!v) {
    throw new Error(`${k} is not set`);
  }

  return v;
};

function chunk<T>(arr: T[], size = 500) {
  const out: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }

  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const SUPABASE_URL = must("SUPABASE_URL");
    const SERVICE_ROLE = must("SUPABASE_SERVICE_ROLE_KEY");
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    /**
     * Only FIFA World Cup
     */
    const competition = WORLD_CUP_COMPETITION;

    const fdUrl = `${FD_BASE}/competitions/${competition}/matches`;

    const res = await fetch(fdUrl, {
      headers: {
        "X-Auth-Token": FD_KEY,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`FD ${res.status} ${res.statusText}: ${txt}`);
    }

    const data = await res.json();

    const matches = Array.isArray(data?.matches) ? data.matches : [];
    const compId = data?.competition?.id ?? null;

    /**
     * For World Cup:
     * matchday can still exist, but knockout games may also use stage.
     */
    const totalMatchdays = matches.reduce((mx, m) => {
      const md = Number(m?.matchday ?? 0);
      return Number.isFinite(md) ? Math.max(mx, md) : mx;
    }, 0);

    /**
     * Update competitions table if competition id exists
     */
    if (compId != null) {
      const { error: compErr } = await supabase
        .from("competitions")
        .update({
          total_fixtures: totalMatchdays,
          updated_at: nowIso(),
        })
        .eq("id", compId);

      if (compErr) {
        throw new Error(`Competition update failed: ${compErr.message}`);
      }
    }

    const rows = matches.map((m) => ({
      id: m.id,
      competition_id: m.competition?.id ?? compId,
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
          away: m?.score?.fullTime?.away ?? null,
        },
        halfTime: {
          home: m?.score?.halfTime?.home ?? null,
          away: m?.score?.halfTime?.away ?? null,
        },
      },
      referee: m?.referees?.[0]?.name ?? null,
      created_at: nowIso(),
      updated_at: nowIso(),
    }));

    let upserted = 0;

    for (const part of chunk(rows, 500)) {
      const { error } = await supabase.from("matches").upsert(part, {
        onConflict: "id",
      });

      if (error) {
        throw new Error(`Upsert failed: ${error.message}`);
      }

      upserted += part.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        competition,
        fetched: rows.length,
        upserted,
        totalMatchdays,
      }),
      {
        headers: corsHeaders,
      },
    );
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const reqId = crypto.randomUUID();

    console.error(
      JSON.stringify({
        tag: "sync-world-cup-matches",
        reqId,
        message: e.message,
        stack: e.stack,
      }),
    );

    return new Response(
      JSON.stringify({
        success: false,
        reqId,
        message: e.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "x-error-id": reqId,
        },
      },
    );
  }
});