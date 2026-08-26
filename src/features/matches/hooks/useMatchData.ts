import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { disabledKey, KEYS } from "@/lib/queryClient";
import { useAuthStore } from "@/store/AuthStore";
import { useLeagueId, usePrimaryLeagueStore } from "@/store/PrimaryLeagueStore";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import { useMemo } from "react";
import { matchesApi } from "../api/matchesApi";
import { sortMemberPredictions } from "../model/predictions";
import type { MatchDetails, MatchListItem, MemberPrediction } from "../types";
import { getMatchRefetchInterval } from "../utils/matchRefetch";

/** enabled should be `isPro && analysis.status === 'available'` — a free user can never see this, so don't fetch it for them. */
export const useMatchAiSummary = (matchId: number, enabled: boolean) => {
  return useQuery({
    queryKey: KEYS.matches.aiSummary(matchId),
    queryFn: enabled ? () => matchesApi.getMatchAiSummary(matchId) : skipToken,
    staleTime: 1000 * 60 * 30,
  });
};

/**
 * Builds a {@link MatchDetails} placeholder for a match by reading it out of the
 * cached season list. Returns undefined when the season cache or the match is
 * missing, so the detail query falls back to its normal loading state.
 */
const useSeasonMatchPlaceholder = (
  matchId: number,
): MatchDetails | undefined => {
  const queryClient = useQueryClient();
  const memberId = usePrimaryLeagueStore((state) => state.memberId);
  const leagueId = usePrimaryLeagueStore((state) => state.leagueId);
  const competitionId = usePrimaryLeagueStore((state) => state.competitionId);
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  const nickname = usePrimaryLeagueStore((state) => state.nickname);
  const avatarUrl = usePrimaryLeagueStore((state) => state.avatarUrl);
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMemo(() => {
    if (
      memberId == null || competitionId == null || seasonId == null ||
      matchId <= 0
    ) {
      return undefined;
    }

    const season = queryClient.getQueryData<MatchListItem[]>(
      KEYS.matches.season(competitionId, seasonId, memberId),
    );
    const found = season?.find((item) => item.id === matchId);
    if (!found) return undefined;

    // MatchListItem and MatchDetails share MatchBaseType. Carry the current
    // member's own prediction (the only one the list holds) into the members
    // list, reattaching the league_member so the prediction form seeds with the
    // saved score instead of 0–0. The other members fill in when the fetch
    // lands.
    const { prediction, ...base } = found;
    const predictions: MemberPrediction[] = prediction
      ? [{
        ...prediction,
        league_member: {
          id: memberId,
          league_id: leagueId ?? "",
          user_id: userId ?? "",
          nickname: nickname ?? "",
          avatar_url: avatarUrl ?? null,
          is_primary: true,
        },
      }]
      : [];
    return { ...base, predictions };
  }, [
    queryClient,
    memberId,
    leagueId,
    competitionId,
    seasonId,
    nickname,
    avatarUrl,
    userId,
    matchId,
  ]);
};

export const useGetMatchData = (matchId: number) => {
  const leagueId = useLeagueId();
  const isFocused = useIsFocused();
  const isReady = Boolean(leagueId && matchId > 0);

  const placeholder = useSeasonMatchPlaceholder(matchId);

  const query = useQuery({
    queryKey: isReady
      ? KEYS.matches.withPredictions(leagueId!, matchId)
      : disabledKey("matches", "detail", matchId || "none"),
    queryFn: isReady
      ? () => matchesApi.getMatchWithPredictions(leagueId!, matchId)
      : skipToken,
    placeholderData: placeholder,
    select: (data) => ({
      ...data,
      predictions: sortMemberPredictions(data?.predictions),
    }),
    refetchInterval: (currentQuery) =>
      isFocused ? getMatchRefetchInterval(currentQuery.state.data) : false,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

  useRefetchOnFocus(query.refetch, isReady);

  return query;
};
