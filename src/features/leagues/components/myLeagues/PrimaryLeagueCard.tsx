import { images } from '@/assets/images';
import { HeaderBackground, LogoBadge, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, Podium, Star, Users } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { LeagueSummary } from '../../types';
type StatBlockProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function StatBlock({ icon, label, value }: StatBlockProps) {
  return (
    <View className="flex-1 items-center gap-1">
      <View className="flex-row items-center justify-center gap-1.5">
        {icon}

        <Text numberOfLines={1} className="text-xs text-muted">
          {label}
        </Text>
      </View>

      <Text numberOfLines={1} className="font-semibold text-text">
        {value}
      </Text>
    </View>
  );
}
function Divider() {
  const { colors } = useThemeTokens();

  return (
    <View
      className="mx-2 h-12 w-px"
      style={{
        backgroundColor: colors.border,
        opacity: 0.7,
      }}
    />
  );
}
export default function PrimaryLeagueCard({ league, onPress }: { league: LeagueSummary; onPress?: () => void }) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.replace('/(app)/(league)/(tabs)');
  };

  return (
    <View className="px-3 mt-4">
      <HeaderBackground>
        <Pressable onPress={handlePress} className="flex-row gap-6 px-3 py-5 border border-border rounded-xl">
          {/* Left Content */}
          <View className=" items-center gap-2">
            <View className="flex-row gap-2">
              <Star size={22} color={colors.primary} fill={colors.primary} />

              <Text className="font-semibold text-primary">
                {t('Primary')}
              </Text>
            </View>
            {/* Trophy */}
            <View className=" h-24 w-24 items-center justify-center rounded-full bg-surface">
              <LinearGradient
                colors={['rgba(255,211,0,0.20)', 'rgba(255,211,0,0.02)']}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                }}
              />

              <ExpoImage
                source={images.trophyGold}
                contentFit="contain"
                style={{
                  width: 115,
                  height: 115,
                }}
              />
            </View>
          </View>

          <View className="flex-1 flex-row items-center ">
            {/* Right content */}
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-4">
                <LogoBadge source={{ uri: league.competition_logo ?? '' }} width={48} height={48} />

                <View className="flex-1">
                  <Text numberOfLines={1} className="text-2xl font-semibold">
                    {league.league_name}
                  </Text>

                  <Text className="text-xl text-muted">
                    {league.nickname}
                  </Text>
                </View>
                <View className="absolute right-3  rounded-full p-1 border border-primary">
                  <ChevronRight size={26} color={colors.primary} />
                </View>
              </View>

              <View
                className="mx-2 my-3 h-0.5 w-full"
                style={{
                  backgroundColor: colors.border,
                  opacity: 0.7,
                }}
              />
              {/* Stats */}
              <View className=" flex-row items-center justify-between">
                <StatBlock
                  icon={<Podium size={18} color={colors.primary} />}
                  label={t('Rank')}
                  value={`#${league.rank}`}
                />

                <Divider />

                <StatBlock
                  icon={<Star size={18} color={colors.primary} fill={colors.primary} />}
                  label={t('Points')}
                  value={`${league.total_points} ${t('pts')}`}
                />

                <Divider />

                <StatBlock
                  icon={<Users size={18} color={colors.primary} />}
                  label={t('Members')}
                  value={`${league.members_count}`}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </HeaderBackground>
    </View>
  );
}
