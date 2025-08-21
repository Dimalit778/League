import { membersService } from "@/services/membersService";
import { useLeagueStore } from "@/store/LeagueStore";
import { useQuery } from "@tanstack/react-query";

export const useGetLeaderboard = () => {
      const { primaryLeague } = useLeagueStore();

    return useQuery({
      queryKey: ['leagues', primaryLeague?.id, 'leaderboard'],
      queryFn: () => membersService.getLeaderboard(primaryLeague?.id!),
      enabled: !!primaryLeague?.id,
      staleTime: 60 * 1000 * 60, 
      retry: 2,
    });
  };

