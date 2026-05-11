import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { CText } from '@/components/ui';
import { useGetTournamentMatches } from '@/features/matches/hooks/useMatches';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { useMemberStore } from '@/store/MemberStore';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import GroupMatches from '../components/tournament/GroupMatches';
import KnockoutMatches from '../components/tournament/KnockoutMatches';
import { hasLeagueStage } from '../utils/tournamentMatches';
import MatchesScreen from './MatchesScreen';

type TournamentView = 'firstPhase' | 'knockout';

const ToggleItem = ({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} className={cn('flex-1 py-1.5 rounded-lg items-center', active && 'bg-primary')}>
    <CText variant="bodyBold" className={active ? 'text-background' : 'text-text'}>
      {label}
    </CText>
  </Pressable>
);

export default function TournamentScreen() {
  const { t } = useTranslation();
  const memberId = useMemberStore((s) => s.memberId) ?? '';
  const competitionId = useMemberStore((s) => s.competitionId) ?? 0;
  const [view, setView] = useState<TournamentView>('firstPhase');

  const { data, isLoading, error, refetch } = useGetTournamentMatches({
    competitionId,
    memberId,
    enabled: true,
  });

  const firstPhaseMatches = data?.firstPhase ?? [];
  const isLeaguePhase = hasLeagueStage(firstPhaseMatches);
  const firstPhaseLabel = isLeaguePhase ? t('League Phase') : t('Groups');

  if (isLoading) return <LoadingOverlay />;
  if (error) return <Error error={error} />;
  return (
    <Screen>
      <View className="flex-row  my-1 rounded-xl bg-surface border border-border">
        <ToggleItem active={view === 'firstPhase'} label={firstPhaseLabel} onPress={() => setView('firstPhase')} />
        <ToggleItem active={view === 'knockout'} label={t('Knockout')} onPress={() => setView('knockout')} />
      </View>
      {view === 'firstPhase' && isLeaguePhase && <MatchesScreen />}

      {view === 'firstPhase' && !isLeaguePhase && <GroupMatches matches={firstPhaseMatches} onRefresh={refetch} />}

      {view === 'knockout' && <KnockoutMatches matches={data?.knockoutStages ?? []} onRefresh={refetch} />}
    </Screen>
  );
}
