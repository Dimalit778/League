import { fixtureService } from "@/services/fixtureService"
import { useAppStore } from "@/store/useAppStore"
import { useQuery } from "@tanstack/react-query"

export const useGetFixturesByRound = (round: string) => {
  const { primaryLeague} = useAppStore()

  const {data, isLoading, error} = useQuery({
    queryKey: ["fixtures", "round", primaryLeague?.competition_id, round],
    queryFn: () => fixtureService.getFixturesByRound(primaryLeague?.competition_id!, round),
    enabled: !!primaryLeague?.competition_id && !!round,
  })

  return {data, isLoading, error}
}
export const useGetFixtureById = (id: number) => {
  const {primaryLeague} = useAppStore()
  const {data, isLoading, error} = useQuery({
    queryKey: ["fixture", id],
    queryFn: () => fixtureService.getFixtureById(id),
    enabled: !!id,
  })
  return {data, isLoading, error}
}
