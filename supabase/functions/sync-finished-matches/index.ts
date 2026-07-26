// sync-finished-matches
// Daily full sync of all matches for leagues + Champions League.
// Cron-only. Football API calls: 6 (one per competition, sequential).
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

const JOB = "sync-finished-matches";
const COMPETITIONS = ["PL", "PD", "SA", "BL1", "FL1", "CL"];

const transformMatch = (m: any) => ({
  id: m.id,
  competition_id: m.competition?.id ?? null,
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
  updated_at: nowIso(),
});

async function bulkUpsertMatches(supabase: any, rows: any[], chunkSize = 500) {
  let updated = 0;
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    const slice = rows.slice(i, i + chunkSize);
    const { data, error } = await supabase.from("matches").upsert(slice, { onConflict: "id" }).select("id");
    if (error) {
      errors.push(error.message);
      console.error("Upsert error:", error.message);
    } else {
      updated += Array.isArray(data) ? data.length : slice.length;
    }
  }
  return { updated, errors };
}

Deno.serve(async (req) => {
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    if (!(await tryAcquireSyncLock(supabase, JOB, 300))) return lockedResponse(JOB);

    try {
      console.info(`Syncing matches for: ${COMPETITIONS.join(", ")}`);

      // Sequential — fdFetch reserves 1 call from the shared 10/min budget each time
      const allMatches: any[] = [];
      const fetchErrors: string[] = [];
      for (const code of COMPETITIONS) {
        try {
          const payload = await fdFetch(supabase, JOB, `${FD_BASE}/competitions/${code}/matches`, FD_KEY);
          const matches = Array.isArray(payload?.matches) ? payload.matches : [];
          console.info(`${code}: ${matches.length} matches`);
          allMatches.push(...matches);
        } catch (e) {
          fetchErrors.push(`${code}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      const rows = allMatches.filter((m: any) => m?.id).map(transformMatch);
      const { updated, errors: upsertErrors } = await bulkUpsertMatches(supabase, rows);
      const allErrors = [...fetchErrors, ...upsertErrors];

      await releaseSyncLock(supabase, JOB, allErrors.length === 0 ? "success" : "partial");
      return jsonResponse({
        success: allErrors.length === 0,
        updated,
        totalFetched: rows.length,
        errors: allErrors.length > 0 ? allErrors : undefined,
      });
    } catch (err) {
      await releaseSyncLock(supabase, JOB, "error");
      throw err;
    }
  } catch (err) {
    return errorResponse(JOB, err);
  }
});
