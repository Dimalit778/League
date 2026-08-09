import { Card, EmptyState, LogoBadge, Row, Section, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';

import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { ChevronLeft, Lock, Star, Trophy, Users } from 'lucide-react-native';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useGetMyLeaguesSummary, useUpdatePrimaryLeague } from '../../hooks/useLeagues';
import { LeagueSummary } from '../../types';
import LeaguesSkeleton from './LeaguesSkeleton';
import PrimaryLeagueCard from './PrimaryLeagueCard';

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Row keepLtr className="flex-1 justify-center gap-1">
      {icon}
      <Text numberOfLines={1} className="text-xs text-muted">
        {label}
      </Text>
      <Text ltr numberOfLines={1} className="text-xs font-bold text-text">
        {value}
      </Text>
    </Row>
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
    <Row className="gap-2">
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
        variant="elevated"
        className="flex-1 overflow-hidden rounded-2xl"
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
        <View className={cn(spacing.list, isLocked && 'opacity-60')}>
          <Row between>
            <Row className="min-w-0 flex-1 gap-3">
              <LogoBadge source={{ uri: league.competition_logo ?? '' }} width={40} height={40} />
              <View className="min-w-0 flex-1 gap-0.5">
                <Row className="gap-2">
                  <Text numberOfLines={1} className="shrink text-lg font-semibold">
                    {league.league_name}
                  </Text>
                  {isLocked ? (
                    <Row keepLtr className="gap-1 rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5">
                      <Lock size={11} color={colors.primary} strokeWidth={2.5} />
                      <Text className="text-[11px] font-bold text-primary">{t('Requires Pro')}</Text>
                    </Row>
                  ) : null}
                </Row>
                <Text numberOfLines={1} className="text-sm text-muted">
                  {league.competition_name}
                </Text>
              </View>
            </Row>

            {isLocked ? (
              <Lock size={18} color={colors.muted} strokeWidth={2} />
            ) : (
              <ChevronLeft size={20} color={colors.muted} strokeWidth={2} />
            )}
          </Row>

          <View className="h-px bg-border" />

          <Row>
            <MiniStat
              icon={<Trophy size={13} color={colors.primary} />}
              label={t('Rank')}
              value={league.rank ? `#${league.rank}` : '—'}
            />
            <View className="h-4 w-px bg-border" />
            <MiniStat
              icon={<Star size={13} color={colors.primary} fill={colors.primary} />}
              label={t('pts')}
              value={`${league.total_points ?? 0}`}
            />
            <View className="h-4 w-px bg-border" />
            <MiniStat
              icon={<Users size={13} color={colors.primary} />}
              label={t('Members')}
              value={`${league.members_count ?? 0}`}
            />
          </Row>
        </View>
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
    <View className={spacing.section}>
      <PrimaryLeagueCard league={primaryLeague} onPress={() => handleLeaguePress(primaryLeague)} />

      {otherLeagues.length > 0 && (
        <Section title={t('Other Leagues')} accent>
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
    </View>
  );
}
