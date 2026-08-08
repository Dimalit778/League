import { Card, EmptyState, LockedBadge, LogoBadge, Row, Section, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';

import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { Podium, Star, Users } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useGetMyLeaguesSummary, useUpdatePrimaryLeague } from '../../hooks/useLeagues';
import { LeagueSummary } from '../../types';
import LeaguesSkeleton from './LeaguesSkeleton';
import PrimaryLeagueCard from './PrimaryLeagueCard';

function StatBlock({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <View className="min-w-6 items-center justify-center gap-1">
      <View>{icon}</View>
      <Text numberOfLines={1} className="font-semibold text-center text-muted">
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
    <Row>
      {isSelectable && (
        <View
          className={cn(
            ' h-8 w-8 items-center justify-center rounded-full border-2',
            isSelected ? 'border-primary bg-primary' : 'border-muted bg-surface',
          )}
        >
          {isSelected ? <View className="h-2.5 w-2.5 rounded-full bg-background" /> : null}
        </View>
      )}
      <Card
        className="flex-1 mx-4 relative overflow-hidden rounded-2xl"
        padding="sm"
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
        <View className={isLocked ? 'opacity-50' : undefined}>
          <Row className="flex-row items-center">
            <LogoBadge source={{ uri: league.competition_logo ?? '' }} width={36} height={36} />
            <View className="mx-3 h-10 w-px bg-border" />
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-xl font-semibold">
                {league.league_name}
              </Text>
              <Text className="text-muted">{league.nickname}</Text>
            </View>
            <View className="mx-2 flex-row gap-2">
              <StatBlock icon={<Podium size={15} color={colors.primary} />} value={`#${league.rank}`} />
              <View className="mx-2 h-12 w-px bg-border" />
              <StatBlock
                icon={<Star size={15} color={colors.primary} fill={colors.primary} />}
                value={`${league.total_points ?? 0}`}
              />
              <View className="mx-2 h-12 w-px bg-border" />
              <StatBlock icon={<Users size={15} color={colors.primary} />} value={`${league.members_count ?? 0}`} />
            </View>
          </Row>
        </View>

        {!isSelectable && isLocked && <LockedBadge visible={isLocked} />}
      </Card>
    </Row>
  );
}

function EmptyLeagues() {
  const { t } = useTranslation();
  return (
    <EmptyState
      className="flex-1 pb-20"
      title={t('No leagues yet')}
      description={t('Create or join a league to get started.')}
    />
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
  const { colors } = useThemeTokens();
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
  if (!myLeagues || myLeagues.length === 0) return <EmptyLeagues />;

  const primaryLeague =
    myLeagues.find((league) => league.league_id === primaryLeagueId) ??
    myLeagues.find((league) => league.is_primary) ??
    myLeagues[0];
  const otherLeagues = myLeagues
    .filter((league) => league.league_id !== primaryLeague.league_id)
    .sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName={cn(spacing.section, 'flex-grow pb-4 pt-2 ')}
    >
      <View className={spacing.list}>
        <Row className="justify-center gap-2">
          <Star size={22} color={colors.primary} fill={colors.primary} />
          <Text variant="title" tone="primary">
            {t('Primary League')}
          </Text>
        </Row>
        <PrimaryLeagueCard league={primaryLeague} onPress={() => handleLeaguePress(primaryLeague)} />
      </View>

      {otherLeagues.length > 0 && (
        <Section title={t('Other Leagues')}>
          <View className={spacing.list}>
            {otherLeagues.map((league) => (
              <LeagueCard
                key={league.league_id}
                league={league}
                isLocked={!league.active && !isPro && !activationSelection}
                isSelectable={!league.active && !!activationSelection}
                isSelected={!!league.member_id && selectedMemberIds.has(league.member_id)}
                onPress={() => handleLeaguePress(league)}
              />
            ))}
          </View>
        </Section>
      )}
    </ScrollView>
  );
}
