import { Text, HeaderSection } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { usePrimaryMember } from '@/store/MemberStore';
import Trophy from '@assets/images/Trophy-champo.png';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useMemberLeagueSummary } from '../../hooks/useLeagues';
function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View className="overflow-hidden flex-1 rounded-xl border border-border py-1 ">
      <View className="mb-1 flex-row items-center  justify-center">
        <Text className="text-xs font-semibold tracking-wide text-muted uppercase ">{label}</Text>
      </View>
      <Text className="text-base text-center  text-primary font-bold ">{value}</Text>
    </View>
  );
}
type PrimaryLeagueCardProps = {
  onPress?: () => void;
};

export default function PrimaryLeagueCard({ onPress }: PrimaryLeagueCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const { memberId } = usePrimaryMember();
  const { data: primaryLeagueSummary, isPending } = useMemberLeagueSummary(memberId);

  if (isPending) {
    return null;
  }

  if (!primaryLeagueSummary) {
    return null;
  }
  const league = primaryLeagueSummary;

  return (
    <HeaderSection>
      <View className="flex-row items-center justify-center  p-2">
        <View className=" justify-center items-center w-40 h-40  ">
          <View className="flex-row items-center gap-2 mb-2">
            <Star size={18} color="#D5B13F" fill="#D5B13F" />
            <Text className=" font-semibold uppercase tracking-wide text-[#D5B13F]">{t('Primary')}</Text>
          </View>
          {/* Trophy circle */}
          <View className="w-28 h-28 items-center justify-center rounded-full border border-white/10 bg-[#091425]">
            <LinearGradient
              colors={['rgba(227,180,33,0.20)', 'rgba(227,180,33,0.02)']}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
              }}
            />
            <Image source={Trophy} contentFit="contain" style={{ width: 140, height: 140 }} />
          </View>
        </View>

        <View className="min-w-0 flex-1">
          <View>
            <Text className="text-2xl font-black text-text" numberOfLines={1}>
              {league.league_name}
            </Text>

            <Text className="mt-1 text-base font-semibold text-muted" numberOfLines={1}>
              {league.nickname}
            </Text>
          </View>

          {/* stats */}
          <View className="mt-2 flex-row items-center">
            <StatBlock label="RANK" value={`#${league.rank}`} />
            <View className="mx-2 h-12 w-px bg-border" />
            <StatBlock label="POINTS" value={`${league.total_points} pts`} />
            <View className="mx-2 h-12 w-px bg-border" />
            <StatBlock label="PENDING" value={`${league.pending_predictions}`} />
          </View>

          {/* Button */}
          <Pressable
            onPress={onPress ?? (() => router.replace('/(app)/(league)/(tabs)'))}
            className="mt-4 h-10 items-center justify-center rounded-2xl border border-border px-5"
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <Text className="text-base font-bold text-text ">Enter league</Text>

            <View className="absolute right-5">
              <ChevronRight size={24} color={colors.text} />
            </View>
          </Pressable>
        </View>
      </View>
    </HeaderSection>
  );
}
