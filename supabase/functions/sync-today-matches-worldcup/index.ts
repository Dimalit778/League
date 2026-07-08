// sync-today-matches-worldcup
// Syncs today's World Cup matches.
// Cron-only (every few minutes during the tournament). 1 football API call per run.
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

const JOB = "sync-today-matches-worldcup";
const WC_CODE = "WC";

const transformMatch = (m: any) => ({
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

Deno.serve(async (req) => {
  const denied = requireSyncAuth(req);
  if (denied) return denied;

  try {
    const supabase = createServiceClient();
    const FD_KEY = must("FOOTBALL_ORG_API_KEY");

    if (!(await tryAcquireSyncLock(supabase, JOB, 120))) return lockedResponse(JOB);

    try {
      // /matches endpoint filtered to WC — returns only today's matches
      const payload = await fdFetch(supabase, JOB, `${FD_BASE}/matches?competitions=${WC_CODE}`, FD_KEY);
      const matches = Array.isArray(payload?.matches) ? payload.matches : [];
      console.info(`Today's WC matches: ${matches.length}`);

      if (matches.length === 0) {
        await releaseSyncLock(supabase, JOB, "success");
        return jsonResponse({ success: true, updated: 0, message: "No WC matches today" });
      }

      const rows = matches.filter((m: any) => m?.id).map(transformMatch);
      const { data, error } = await supabase.from("matches").upsert(rows, { onConflict: "id" }).select("id");
      if (error) throw new Error(`Upsert failed: ${error.message}`);

      const updated = data?.length ?? rows.length;
      console.info(`Updated ${updated} WC matches`);
      await releaseSyncLock(supabase, JOB, "success");
      return jsonResponse({ success: true, updated, totalFetched: rows.length });
    } catch (err) {
      await releaseSyncLock(supabase, JOB, "error");
      throw err;
    }
  } catch (err) {
    return errorResponse(JOB, err);
  }
});
