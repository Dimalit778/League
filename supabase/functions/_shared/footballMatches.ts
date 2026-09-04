// Pure validation/mapping helpers for football-data.org match payloads.
// Keep provider data out of Postgres until the enum-bearing fields are known-safe.
// deno-lint-ignore-file no-explicit-any
import { describeError, logException, logStructured } from "./monitoring.ts";

export const MATCH_STATUSES = [
  "TIMED",
  "SCHEDULED",
  "IN_PLAY",
  "LIVE",
  "FINISHED",
  "POSTPONED",
  "PAUSED",
  "EXTRA_TIME",
  "PENALTY_SHOOTOUT",
  "SUSPENDED",
  "CANCELLED",
  "AWARDED",
] as const;

export type MatchStatus = typeof MATCH_STATUSES[number];

const MATCH_STATUS_SET = new Set<string>(MATCH_STATUSES);
const RESULT_WINNERS = new Set(["HOME_TEAM", "AWAY_TEAM", "DRAW"]);
const DATE_LIKE_STATUS = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export const isMatchStatus = (value: unknown): value is MatchStatus =>
  typeof value === "string" && MATCH_STATUS_SET.has(value);

export const inferStatusFromMalformedTimestamp = (
  match: any,
  nowMs = Date.now(),
): MatchStatus | null => {
  if (
    typeof match?.status !== "string" || !DATE_LIKE_STATUS.test(match.status)
  ) return null;

  const home = match?.score?.fullTime?.home;
  const away = match?.score?.fullTime?.away;
  const winner = match?.score?.winner;
  const hasCompleteScore = Number.isInteger(home) && Number.isInteger(away);

  if (hasCompleteScore && RESULT_WINNERS.has(winner)) return "FINISHED";

  if (Number.isFinite(match?.minute) || home != null || away != null) {
    if (match?.score?.duration === "PENALTY_SHOOTOUT") {
      return "PENALTY_SHOOTOUT";
    }
    if (match?.score?.duration === "EXTRA_TIME") return "EXTRA_TIME";
    return "IN_PLAY";
  }

  const kickOffMs = Date.parse(match?.utcDate ?? "");
  return Number.isFinite(kickOffMs) && nowMs < kickOffMs ? "TIMED" : null;
};

export type RejectedMatch = {
  id: unknown;
  status: unknown;
  kickOff: unknown;
  reason: string;
  signals?: {
    minute: unknown;
    injuryTime: unknown;
    winner: unknown;
    duration: unknown;
    fullTimeHome: unknown;
    fullTimeAway: unknown;
    lastUpdated: unknown;
  };
};

type MapOptions = {
  updatedAt: "provider" | "now";
  fallbackCompetitionId?: number | null;
};

type MatchByIdFetcher = (matchId: number) => Promise<unknown>;

export const mapFootballMatches = (matches: any[], options: MapOptions) => {
  const rows: Record<string, unknown>[] = [];
  const rejected: RejectedMatch[] = [];
  const now = options.updatedAt === "now" ? new Date().toISOString() : null;

  for (const match of matches) {
    const signals = {
      minute: match?.minute,
      injuryTime: match?.injuryTime,
      winner: match?.score?.winner,
      duration: match?.score?.duration,
      fullTimeHome: match?.score?.fullTime?.home,
      fullTimeAway: match?.score?.fullTime?.away,
      lastUpdated: match?.lastUpdated,
    };

    if (!Number.isInteger(match?.id)) {
      rejected.push({
        id: match?.id,
        status: match?.status,
        kickOff: match?.utcDate,
        reason: "missing_or_invalid_id",
        signals,
      });
      continue;
    }

    if (!isMatchStatus(match?.status)) {
      rejected.push({
        id: match.id,
        status: match?.status,
        kickOff: match?.utcDate,
        reason: "invalid_match_status",
        signals,
      });
      continue;
    }

    rows.push({
      id: match.id,
      competition_id: match.competition?.id ?? options.fallbackCompetitionId ??
        null,
      season_id: match.season?.id ?? null,
      fixture: match.matchday ?? null,
      kick_off: match.utcDate ?? null,
      status: match.status,
      stage: match.stage ?? null,
      group: match.group ?? null,
      home_team_id: match.homeTeam?.id ?? null,
      away_team_id: match.awayTeam?.id ?? null,
      score: {
        winner: match.score?.winner ?? null,
        duration: match.score?.duration ?? null,
        fullTime: {
          home: match.score?.fullTime?.home ?? null,
          away: match.score?.fullTime?.away ?? null,
        },
        halfTime: {
          home: match.score?.halfTime?.home ?? null,
          away: match.score?.halfTime?.away ?? null,
        },
      },
      referee: match.referees?.[0]?.name ?? null,
      updated_at: options.updatedAt === "provider"
        ? match.lastUpdated ?? null
        : now,
    });
  }

  return { rows, rejected };
};

export const logRejectedMatches = (job: string, rejected: RejectedMatch[]) => {
  for (const match of rejected) {
    logStructured("error", "match.payload_rejected", {
      function: job,
      matchId: match.id == null ? null : String(match.id),
      receivedStatus: match.status == null ? null : String(match.status),
      kickOff: match.kickOff == null ? null : String(match.kickOff),
      reason: match.reason,
      signals: match.signals == null ? null : JSON.stringify(match.signals),
    });
  }
};

export const retryRejectedMatchesById = async (
  job: string,
  rejected: RejectedMatch[],
  options: MapOptions,
  fetchMatchById: MatchByIdFetcher,
  nowMs = Date.now(),
) => {
  const rows: Record<string, unknown>[] = [];
  const unresolved: RejectedMatch[] = [];

  for (const rejectedMatch of rejected) {
    if (!Number.isInteger(rejectedMatch.id)) {
      unresolved.push(rejectedMatch);
      continue;
    }

    const matchId = rejectedMatch.id as number;
    try {
      const detail = await fetchMatchById(matchId) as any;
      let remapped = mapFootballMatches([detail], options);
      let inferredStatus: MatchStatus | null = null;
      if (remapped.rejected.length > 0) {
        inferredStatus = inferStatusFromMalformedTimestamp(detail, nowMs);
        if (inferredStatus) {
          remapped = mapFootballMatches(
            [{ ...detail, status: inferredStatus }],
            options,
          );
        }
      }
      if (remapped.rows.length === 1 && remapped.rejected.length === 0) {
        rows.push(remapped.rows[0]);
        logStructured("warning", "match.payload_recovered", {
          function: job,
          matchId: String(matchId),
          listStatus: rejectedMatch.status == null
            ? null
            : String(rejectedMatch.status),
          detailStatus: String(remapped.rows[0].status),
          inferred: inferredStatus !== null,
        });
        continue;
      }

      unresolved.push(remapped.rejected[0] ?? rejectedMatch);
    } catch (error) {
      logException(job, error, {
        operation: "match.detail_refetch",
        matchId: String(matchId),
        listStatus: rejectedMatch.status == null
          ? null
          : String(rejectedMatch.status),
      });
      unresolved.push(rejectedMatch);
    }
  }

  return { rows, rejected: unresolved };
};

export const upsertMatchRows = async (
  supabase: any,
  job: string,
  rows: Record<string, unknown>[],
  chunkSize = 500,
) => {
  let updated = 0;
  const errors: string[] = [];

  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const part = rows.slice(offset, offset + chunkSize);
    const bulkResult = await supabase.from("matches").upsert(part, {
      onConflict: "id",
    }).select("id");
    if (!bulkResult.error) {
      updated += Array.isArray(bulkResult.data)
        ? bulkResult.data.length
        : part.length;
      continue;
    }

    logException(job, bulkResult.error, {
      operation: "matches.bulk_upsert",
      rowCount: part.length,
    });

    // A bulk error does not identify the offending row. Retry individually only
    // on this failure path so healthy matches still sync and logs name the bad row.
    for (const row of part) {
      const rowResult = await supabase.from("matches").upsert(row, {
        onConflict: "id",
      }).select("id");
      if (!rowResult.error) {
        updated += Array.isArray(rowResult.data) ? rowResult.data.length : 1;
        continue;
      }

      const details = describeError(rowResult.error);
      logException(job, rowResult.error, {
        operation: "matches.row_upsert",
        matchId: row.id == null ? null : String(row.id),
        matchStatus: row.status == null ? null : String(row.status),
        kickOff: row.kick_off == null ? null : String(row.kick_off),
      });
      errors.push(
        `${row.id ?? "unknown"}: ${
          details.errorCode ?? "DB_ERROR"
        } ${details.errorMessage}`,
      );
    }
  }

  return { updated, errors };
};
