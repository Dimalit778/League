import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { leaderboardService } from '@/services/leaderboardService';
import { useMemberStore } from '@/store/MemberStore';
import { useQuery } from '@tanstack/react-query';

export const useGetLeagueLeaderboard = () => {
  const leagueId = useMemberStore((s) => s.member?.league_id);

  return useQuery({
    queryKey: QUERY_KEYS.leaderboard.byLeague(leagueId),
    queryFn: () => leaderboardService.getLeagueLeaderboard(leagueId!),
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
