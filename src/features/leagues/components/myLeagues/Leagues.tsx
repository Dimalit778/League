import { Card, LogoBadge, Text } from '@/components/ui';
import { LockedBadge } from '@/components/ui/LockedBadge';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { Podium, Star, Users } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useGetMyLeaguesSummary, useUpdatePrimaryLeague } from '../../hooks/useLeagues';
import { LeagueSummary } from '../../types';
import PrimaryLeagueCard from './PrimaryLeagueCard';

function StatBlock({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <View className="items-center justify-center gap-1">
      <View>{icon}</View>
      <Text semibold className="text-center text-muted" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function LeagueCard({ league, onPress }: { league: LeagueSummary; onPress: () => void }) {
  const { colors } = useThemeTokens();
  const isLocked = !league.active;

  return (
    <View className="px-6">
      <Card padding="lg" contentClassName="justify-center" onPress={isLocked ? undefined : onPress}>
        {isLocked && <LockedBadge />}
        <View
          className="relative justify-center"
          style={{
            opacity: isLocked ? 0.2 : 1,
          }}
        >
          <View className="flex-row items-center">
            <LogoBadge source={{ uri: league.competition_logo ?? '' }} width={36} height={36} />
            <View className="mx-3 h-10 w-px bg-border" />
            <View className="min-w-0 flex-1">
              <Text h3 semibold numberOfLines={1}>
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
          </View>
        </View>
      </Card>
    </View>
  );
}

export function Leagues() {
  const { data: myLeagues } = useGetMyLeaguesSummary();
  const { mutateAsync: updatePrimaryLeague } = useUpdatePrimaryLeague();
  const primaryLeagueId = usePrimaryLeagueStore((state) => state.leagueId);
  const setPrimaryLeague = usePrimaryLeagueStore((state) => state.setPrimaryLeague);

  const handleLeaguePress = async (league: LeagueSummary) => {
    if (!league.member_id || !league.league_id || !league.competition_id) return;

    setPrimaryLeague({ memberId: league.member_id, leagueId: league.league_id, competitionId: league.competition_id });
    router.replace('/(app)/(league)/(tabs)');
    await updatePrimaryLeague({ leagueId: league.league_id });
  };

  if (!myLeagues) return null;

  // Store is updated immediately on select; query `is_primary` lags until refetch.
  const primaryLeague =
    myLeagues.find((league) => league.league_id === primaryLeagueId) ?? myLeagues.find((league) => league.is_primary);
  const otherLeagues = myLeagues.filter((league) => league.league_id !== primaryLeague?.league_id);

  return (
    <ScrollView contentContainerClassName="gap-6">
      {primaryLeague && <PrimaryLeagueCard league={primaryLeague} />}

      {otherLeagues.map((league) => {
        return <LeagueCard key={league.league_id} league={league} onPress={() => handleLeaguePress(league)} />;
      })}
    </ScrollView>
  );
}
