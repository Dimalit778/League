// sync-world-cup-matches
// Admin-only manual full sync of World Cup matches. 1 football API call.
// deno-lint-ignore-file no-explicit-any
import {
  createServiceClient,
  errorResponse,
  FD_BASE,
  fdFetch,
  jsonResponse,
  lockedResponse,
  must,
  nowIso,
  releaseSyncLock,
  requireSyncAuth,
  tryAcquireSyncLock,
} from "../_shared/sync.ts";

const JOB = "sync-world-cup-matches";
const WORLD_CUP_COMPETITION = "WC";

function chunk<T>(arr: T[], size = 500): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

Deno.serve(async (req) => {
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    if (!(await tryAcquireSyncLock(supabase, JOB, 120))) return lockedResponse(JOB);

    try {
      const data = await fdFetch(
        supabase,
        JOB,
        `${FD_BASE}/competitions/${WORLD_CUP_COMPETITION}/matches`,
        FD_KEY,
      );
      const matches = Array.isArray(data?.matches) ? data.matches : [];
      const compId = data?.competition?.id ?? null;

      const totalMatchdays = matches.reduce((mx: number, m: any) => {
        const md = Number(m?.matchday ?? 0);
        return Number.isFinite(md) ? Math.max(mx, md) : mx;
      }, 0);

      if (compId != null) {
        const { error: compErr } = await supabase
          .from("competitions")
          .update({ total_matchdays: totalMatchdays, updated_at: nowIso() })
          .eq("id", compId);
        if (compErr) {
          throw new Error(`Competition update failed: ${compErr.message}`);
        }
      }

      const rows = matches.map((m: any) => ({
        id: m.id,
        competition_id: m.competition?.id ?? compId,
        season_id: m.season?.id ?? null,
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
        // created_at intentionally omitted: upsert must not overwrite it
        updated_at: nowIso(),
      }));

      let upserted = 0;
      for (const part of chunk(rows, 500)) {
        const { error } = await supabase.from("matches").upsert(part, { onConflict: "id" });
        if (error) {
          throw new Error(`Upsert failed: ${error.message}`);
        }
        upserted += part.length;
      }

      await releaseSyncLock(supabase, JOB, "success");
      return jsonResponse({
        success: true,
        competition: WORLD_CUP_COMPETITION,
        fetched: rows.length,
        upserted,
        totalMatchdays,
      });
    } catch (err) {
      await releaseSyncLock(supabase, JOB, "error");
      throw err;
    }
  } catch (err) {
    return errorResponse(JOB, err);
  }
});
