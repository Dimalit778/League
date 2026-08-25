import { disabledKey, KEYS } from "@/lib/queryClient";
import { usePrimaryLeagueStore } from "@/store/PrimaryLeagueStore";
import { skipToken, useQuery } from "@tanstack/react-query";
import { matchesApi } from "../api/matchesApi";

export const useGetTodayMatches = ({
  competitionId,
  memberId,
}: {
  competitionId: number;
  memberId: string;
}) => {
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  const isReady = competitionId != null && seasonId != null && memberId != null;

  return useQuery({
    queryKey: isReady
      ? KEYS.matches.upcoming(competitionId, seasonId, memberId)
      : disabledKey("matches", "today", competitionId, seasonId, memberId),
    queryFn: isReady
      ? () => matchesApi.getTodayMatches(competitionId, seasonId, memberId)
      : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};
