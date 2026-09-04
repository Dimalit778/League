import { Card, EmptyState, MyImage, Row, Section, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';

import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { Crown, Lock, Star, Users } from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useGetMyLeaguesSummary, useUpdatePrimaryLeague } from '../../hooks/useLeagues';
import { LeagueSummary } from '../../types';
import LeaguesSkeleton from './LeaguesSkeleton';
import PrimaryLeagueCard from './PrimaryLeagueCard';

function MiniStat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <View className="flex-1 justify-center gap-2 items-center">
      {icon}

      <Text ltr variant="caption" tone="muted" numberOfLines={1} className=" font-bold">
        {value}
      </Text>
    </View>
  );
}

function LeagueCard({
  league,
  isLocked,
  isSelectable,
  isSelected,
  onPress,
}: {
  league: LeagueSummary;
  isLocked: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <>
      {isSelectable && (
        <View
          className={cn(
            'h-8 w-8 items-center justify-center rounded-full border-2',
            isSelected ? 'border-primary bg-primary' : 'border-muted bg-surface',
          )}
        >
          {isSelected ? <View className="h-2.5 w-2.5 rounded-full bg-background" /> : null}
        </View>
      )}
      <Card
        variant="soft"
        padding="md"
        onPress={onPress}
        accessibilityLabel={league.league_name ?? undefined}
        accessibilityHint={
          isSelectable
            ? (t('Select league to activate') ?? undefined)
            : isLocked
              ? (t('Upgrade to Pro') ?? undefined)
              : undefined
        }
      >
        <View className={cn(isLocked && 'opacity-25')}>
          <Row className="w-full min-w-0 gap-3">
            <MyImage source={league.competition_flag ?? ''} width={40} height={40} />
            <View className="flex-1">
              <Text numberOfLines={2} weight="semibold" className="text-lg">
                {league.league_name}
              </Text>
              <Text numberOfLines={1} className="text-sm text-muted">
                {league.competition_name}
              </Text>
            </View>
            <Row className="w-1/3 gap-2">
              <MiniStat icon={<Crown size={16} color={colors.muted} />} value={league.rank ? `#${league.rank}` : '—'} />
              <View className="h-8 w-px bg-border" />
              <MiniStat
                icon={<Star size={16} color={colors.muted} fill={colors.muted} />}
                value={`${league.total_points ?? 0}`}
              />
              <View className="h-8 w-px bg-border" />
              <MiniStat icon={<Users size={16} color={colors.muted} />} value={`${league.members_count ?? 0}`} />
            </Row>
          </Row>
        </View>
        {isLocked && (
          <View className="absolute inset-0 items-center justify-center">
            <Lock size={28} color={colors.error} strokeWidth={2} />
          </View>
        )}
      </Card>
    </>
  );
}

type ActivationSelection = {
  selectedMemberIds: string[];
  onToggleLeague: (memberId: string) => void;
} | null;

export function Leagues({
  isPro,
  upgrade,
  activationSelection = null,
}: {
  isPro: boolean;
  upgrade: () => Promise<boolean>;
  activationSelection?: ActivationSelection;
}) {
  const { data: myLeagues, isLoading } = useGetMyLeaguesSummary();
  const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const primaryLeagueId = usePrimaryLeagueStore((state) => state.leagueId);
  const setPrimaryLeague = usePrimaryLeagueStore((state) => state.setPrimaryLeague);
  const { t } = useTranslation();
  const selectedMemberIds = useMemo(
    () => new Set(activationSelection?.selectedMemberIds ?? []),
    [activationSelection?.selectedMemberIds],
  );

  const handleLeaguePress = async (league: LeagueSummary) => {
    if (!league.member_id || !league.league_id || !league.competition_id) return;
    if (!league.active) {
      if (activationSelection) {
        activationSelection.onToggleLeague(league.member_id);
        return;
      }

      const upgraded = await upgrade();
      if (!upgraded) return;
    }
    setPrimaryLeague({
      memberId: league.member_id,
      leagueId: league.league_id,
      competitionId: league.competition_id,
      seasonId: league.competition_season_id,
      nickname: league.nickname,
      avatarUrl: null,
    });
    router.replace('/(app)/(league)/(tabs)');
    await updatePrimaryLeague({ leagueId: league.league_id });
  };

  if (isLoading) return <LeaguesSkeleton />;
  if (!myLeagues || myLeagues.length === 0)
    return <EmptyState title={t('No leagues found')} description={t('Create a league to get started')} />;
  const primaryLeague =
    myLeagues.find((league) => league.active && league.is_primary && league.league_id === primaryLeagueId) ??
    myLeagues.find((league) => league.active && league.is_primary) ??
    null;
  const otherLeagues = myLeagues
    .filter((league) => league.league_id !== primaryLeague?.league_id)
    .sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <View className="gap-10">
      {primaryLeague && <PrimaryLeagueCard league={primaryLeague} onPress={() => handleLeaguePress(primaryLeague)} />}

      {otherLeagues.length > 0 && (
        <Section title={t(primaryLeague ? 'Other Leagues' : 'My Leagues')} accent>
          <View className={spacing.list}>
            {otherLeagues.map((league) => (
              <LeagueCard
                key={league.league_id}
                league={league}
                isLocked={!league.active && (league.competition_is_free === false || (!isPro && !activationSelection))}
                isSelectable={!league.active && !!activationSelection && league.competition_is_free !== false}
                isSelected={!!league.member_id && selectedMemberIds.has(league.member_id)}
                onPress={() => handleLeaguePress(league)}
              />
            ))}
          </View>
        </Section>
      )}
    </View>
  );
}
