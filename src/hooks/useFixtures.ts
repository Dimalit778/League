import { fixtureService } from "@/services/fixtureService";
import { useLeagueStore } from "@/store/LeagueStore";
import { useQuery } from "@tanstack/react-query";

export const useGetFixturesByRound = (round: string) => { 
  const {primaryLeague} = useLeagueStore()
 return useQuery({
    queryKey: ['fixtures', 'round', primaryLeague?.competition_id, round],
    queryFn: () => fixtureService.getFixturesByRound(round, primaryLeague?.competition_id),
  })
 
}
export const useGetFixtureById = (id: number) => {
  return useQuery({
    queryKey: ["fixture", id],
    queryFn: () => fixtureService.getFixtureById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
 
}

