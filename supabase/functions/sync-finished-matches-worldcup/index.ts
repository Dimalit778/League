// sync-finished-matches-worldcup
// Daily full sync of all World Cup matches + competition stage progress.
// Cron-only (tournament period). Football API calls: 1.
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
import { upsertCurrentSeason } from "../_shared/seasons.ts";

const JOB = "sync-finished-matches-worldcup";
const WC_CODE = "WC";
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
  "FINAL",
];

function deriveCupProgress(matches: any[]) {
  const started = matches.filter((m) => m?.status !== "SCHEDULED");
  const pool = started.length > 0 ? started : matches;
  const activeStages = new Set(pool.map((m) => m?.stage).filter(Boolean));
  let current_stage: string | null = null;
  for (const s of STAGE_ORDER) {
    if (activeStages.has(s)) current_stage = s;
  }
  if (!current_stage && pool.length > 0) current_stage = pool[pool.length - 1]?.stage ?? null;
  let current_matchday: number | null = null;
  if (current_stage === "GROUP_STAGE") {
    const played = started
      .filter((m) => m?.stage === "GROUP_STAGE" && typeof m?.matchday === "number")
      .map((m) => m.matchday);
    current_matchday = played.length > 0 ? Math.max(...played) : 1;
  }
  return { current_stage, current_matchday };
}

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
      console.info("Syncing World Cup matches...");
      const payload = await fdFetch(supabase, JOB, `${FD_BASE}/competitions/${WC_CODE}/matches`, FD_KEY);
      const matches = Array.isArray(payload?.matches) ? payload.matches : [];
      console.info(`WC: ${matches.length} matches`);

      // Update progress on the canonical current season row.
      const compId = payload?.competition?.id ?? null;
      const seasonId = matches.find((match: any) => match?.season?.id)?.season?.id ?? null;
      if (compId && seasonId) {
        const progress = deriveCupProgress(matches);
        await upsertCurrentSeason(supabase, {
          id: seasonId,
          competition_id: compId,
          current_stage: progress.current_stage,
          current_matchday: progress.current_matchday,
        });
        console.info(`Updated WC progress: stage=${progress.current_stage}, matchday=${progress.current_matchday}`);
      }

      const rows = matches.filter((m: any) => m?.id).map(transformMatch);
      const { updated, errors } = await bulkUpsertMatches(supabase, rows);

      await releaseSyncLock(supabase, JOB, errors.length === 0 ? "success" : "partial");
      return jsonResponse({
        success: errors.length === 0,
        updated,
        totalFetched: rows.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (err) {
      await releaseSyncLock(supabase, JOB, "error");
      throw err;
    }
  } catch (err) {
    return errorResponse(JOB, err);
  }
});
