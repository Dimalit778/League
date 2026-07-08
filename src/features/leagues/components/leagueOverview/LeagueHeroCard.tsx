import Trophy from '@/assets/images/Trophy-champo.png';
import { Text } from '@/components/ui/Text';
import { LeagueOverviewLeague, LeagueOverviewMemberStats } from '@/features/leagues/types/leagueOverviewType';
import { useTranslation } from '@/hooks/useTranslation';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
type Props = {
  league: LeagueOverviewLeague;
  memberStats: LeagueOverviewMemberStats;
};

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="bg-cardBorder rounded-full p-2">
      <Text className="text-muted text-xs font-semibold">{label}</Text>
      <Text className="text-white text-xl font-bold mt-1">{value}</Text>
    </View>
  );
}

export function LeagueHeroCard({ league, memberStats }: Props) {
  const { t } = useTranslation();

  return (
    <View className="px-3">
      <View className="flex-row border border-border rounded-md p-2">
        <Image source={Trophy} style={{ width: 120, height: 120 }} contentFit="contain" />

        <View className="flex-1">
          <Text className="text-text text-3xl font-bold" numberOfLines={2}>
            {league.name}
          </Text>

          <Text className="text-text text-xl mt-5" numberOfLines={1}>
            {memberStats.nickname}
          </Text>

          <View className="flex-row justify-between mt-4">
            <StatItem label={t('RANK')} value={memberStats.rank > 0 ? `#${memberStats.rank}` : '—'} />
            <StatItem label={t('POINTS')} value={`${memberStats.points} ${t('pts')}`} />
            <StatItem label={t('PENDING')} value={memberStats.pendingPredictions} />
          </View>

          <Link href="/(app)/(league)/(tabs)/Matches" asChild>
            <Pressable
              className="h-14 rounded-2xl bg-primaryGold flex-row items-center justify-center mt-5"
              accessibilityRole="button"
            >
              <Text className="text-black font-bold text-lg">{t('Predict now')}</Text>
              <ChevronRight size={24} color="black" />
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
