import { fixtureService } from "@/services/fixtureService";
import { useQuery } from "@tanstack/react-query";

export const useGetFixturesByRound = (round: string, competitionId: number) => { 
 return useQuery({
    queryKey: ['fixtures', 'round', competitionId, round],
    queryFn: () => fixtureService.getFixturesByRound(round, competitionId),
    enabled: !!round && !!competitionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
export const useGetFixturesWithPredictions = (round: string, competitionId: number, userId: string) => {
 
  return useQuery({
     queryKey: ['fixtures', 'predictions'],
    queryFn: () => fixtureService.getFixturesWithPredictions(round, competitionId, userId),
    enabled: !!round && !!competitionId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    
  })
}

