import { KEYS } from '@/lib/queryClient';
import { selectCompetitionId, useMemberStore } from '@/store/MemberStore';
import { skipToken, useQuery } from '@tanstack/react-query';
import { competitionApi } from '../api/competitionApi';

const STATIC_COMPETITION_STALE_TIME = 1000 * 60 * 60 * 24;
const MATCH_META_STALE_TIME = 1000 * 60 * 5;

export const useGetCompetitions = () => {
  return useQuery({
    queryKey: KEYS.competitions.all,
    queryFn: competitionApi.getCompetitions,
    staleTime: STATIC_COMPETITION_STALE_TIME,
  });
};

export const useGetCompetitionsDetails = () => {
  const competitionId = useMemberStore(selectCompetitionId);

  return useQuery({
    queryKey: competitionId
      ? KEYS.competitions.matchMeta(competitionId)
      : (['competitions', 'match-meta', 'disabled'] as const),
    queryFn: competitionId ? () => competitionApi.getCompetitionsDetails(competitionId) : skipToken,
    staleTime: MATCH_META_STALE_TIME,
  });
};

