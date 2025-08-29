import { QUERY_KEYS } from "@/lib/queryKeys";
import { fixtureService } from "@/services/fixtureService";
import { useQuery } from "@tanstack/react-query";

export const useGetFixturesByRound = (round: string, competitionId: number) => { 
 return useQuery({
    queryKey: ['fixtures', 'round', competitionId, round],
    queryFn: () => fixtureService.getFixturesByRound(round, competitionId),
    enabled: !!round && !!competitionId,
  })
 
}
export const useGetFixtureById = (id: number) => {
  return useQuery({
    queryKey: ["fixture", id],
    queryFn: () => fixtureService.getFixtureById(id),
    enabled: !!id,
  
  })
 

}
export const useGetFixturesWithPredictions = (round: string, competitionId: number, userId: string) => {
  return useQuery({
     queryKey: [QUERY_KEYS.allFixtures(userId, round, competitionId)],
     
    queryFn: () => fixtureService.getFixturesWithPredictions(round, competitionId, userId),
    enabled: !!round && !!competitionId && !!userId,
    
  })
}

