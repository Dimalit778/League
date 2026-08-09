import { KEYS } from "@/lib/queryClient";
import { useLeagueId } from "@/store/PrimaryLeagueStore";
import { prefetchMatchTeamLogos } from "@/utils/prefetchTeamLogos";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { matchesApi } from "../api/matchesApi";

/** enabled should be `isPro && analysis.status === 'available'` — a free user can never see this, so don't fetch it for them. */
export const useMatchAiSummary = (matchId: number, enabled: boolean) => {
  return useQuery({
    queryKey: KEYS.matches.aiSummary(matchId),
    queryFn: enabled ? () => matchesApi.getMatchAiSummary(matchId) : skipToken,
    staleTime: 1000 * 60 * 30,
  });
};

export const useGetMatchData = (matchId: number) => {
    const leagueId = useLeagueId();
    const query = useQuery({
      queryKey:
        leagueId && matchId > 0
          ? KEYS.matches.withPredictions(leagueId, matchId)
          : (['matches', 'detail', 'disabled', matchId || 'none'] as const),
      queryFn: leagueId && matchId ? () => matchesApi.getMatchWithPredictions(leagueId, matchId) : skipToken,
      select: (data) => {
        const sortedPredictions = [...(data?.predictions ?? [])].sort((a, b) => {
          const diff = (b.points ?? 0) - (a.points ?? 0);
          if (diff !== 0) return diff;
          return (a.league_member?.nickname ?? '').localeCompare(b.league_member?.nickname ?? '');
        });
        data.predictions = sortedPredictions;
        return data;
      },
  
      staleTime: 1000 * 60 * 5,
    });
  
    useEffect(() => {
      if (query.data) prefetchMatchTeamLogos(query.data);
    }, [query.data]);
  
    return query;
  };
  