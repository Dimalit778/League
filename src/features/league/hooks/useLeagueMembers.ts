import { useLeagueMembers } from "@/features/league/services/leagueMembers";
import { useQuery } from "@tanstack/react-query";

export const useGetLeaderboard = (leagueId: string) => {
   
    
    const leagueMembers = useLeagueMembers();
  
    return useQuery({
      queryKey: ["leaderboard"],
      queryFn: () => leagueMembers.getLeaderboard(leagueId),
      enabled: !!leagueId,
      staleTime: 60 * 1000 * 60, 
      retry: 2,
    });
  };
  