import { CText } from '@/components/ui/CText';
import { MyLeagueType } from '@/features/leagues/types';
import { MemberStatsType } from '@/features/members/types';
import { Image } from 'expo-image';
import { ChevronRight, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
type Props = {
  league: MyLeagueType;
  memberStats: MemberStatsType;
};
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <View>
      <CText className="text-muted text-xs font-semibold">{label}</CText>
      <CText className="text-white text-xl font-bold mt-1">{value}</CText>
    </View>
  );
}

export function LeagueHeroCard({ league, memberStats }: Props) {
  return (
    <View className="rounded-3xl border border-cardBorder bg-card p-5 overflow-hidden">
      <View className="flex-row gap-5">
        <Image source={require('@assets/images/trophy.png')} className="w-32 h-40" resizeMode="contain" />

        <View className="flex-1">
          <CText className="text-white text-3xl font-bold">{league.name}</CText>

          {league.isPrimary && (
            <View className="flex-row items-center mt-2">
              <Star size={16} color="#B8E35A" fill="#B8E35A" />
              <CText className="text-white ml-2">Primary league</CText>
            </View>
          )}

          <CText className="text-white text-xl mt-5">{memberStats.nickname}</CText>

          <View className="flex-row justify-between mt-4">
            <StatItem label="RANK" value={`#${memberStats.rank}`} />
            <StatItem label="POINTS" value={`${memberStats.points} pts`} />
            <StatItem label="PENDING" value={memberStats.pendingPredictions} />
          </View>

          <Pressable className="h-14 rounded-2xl bg-primaryGold flex-row items-center justify-center mt-5">
            <CText className="text-black font-bold text-lg">Predict now</CText>
            <ChevronRight size={24} color="black" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
