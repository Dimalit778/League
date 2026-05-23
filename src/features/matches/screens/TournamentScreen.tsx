import { LoadingOverlay, Screen } from '@/components/layout';
import { useGetTournamentActiveStage } from '@/features/matches/hooks/useMatches';
import { selectCompetition, selectCompetitionId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { useMemo } from 'react';
import { isKnockoutOnlyStage } from '../types/footballStages';
import TournamentMatches from './TournamentMatches';

export default function TournamentScreen() {
  const memberId = useMemberStore(selectMemberId);
  const competitionId = useMemberStore(selectCompetitionId);
  const competition = useMemberStore(selectCompetition);
  const { data: activeStage } = useGetTournamentActiveStage({ competitionId });

  const defaultView = useMemo(() => {
    const stage = activeStage?.activeStage ?? competition?.current_stage;
    return isKnockoutOnlyStage(stage) ? 'knockout' : 'groups';
  }, [activeStage?.activeStage, competition?.current_stage]);

  if (!competitionId || !memberId) return <LoadingOverlay />;

  return (
    <Screen>
      <TournamentMatches competitionId={competitionId} memberId={memberId} defaultView={defaultView} />
    </Screen>
  );
}
