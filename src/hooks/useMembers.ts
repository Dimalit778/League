import { membersService } from "@/services/membersService";
import { useAppStore } from "@/store/useAppStore";
import { useQuery } from "@tanstack/react-query";

export const useGetLeaderboard = () => {
    const { user } = useAppStore();

    return useQuery({
      queryKey: ['leagues', user?.primary_league_id, 'leaderboard'],
      queryFn: () => membersService.getLeaderboard(user?.primary_league_id!),
      enabled: !!user?.primary_league_id,
      staleTime: 60 * 1000 * 60, 
      retry: 2,
    });
  };

