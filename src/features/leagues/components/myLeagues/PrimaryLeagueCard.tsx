import { images } from '@/assets/images';
import { LogoBadge, Text } from '@/components/ui';
import { HeaderSection } from '@/components/ui/HeaderSection';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsRTL } from '@/providers/LanguageProvider';
import { usePrimaryMember } from '@/store/MemberStore';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, Clock3, Podium, Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useMemberLeagueSummary } from '../../hooks/useLeagues';
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

        <Text small className="text-muted" numberOfLines={1}>
          {label}
        </Text>
      </View>

      <Text semibold className="text-text" numberOfLines={1}>
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
export default function PrimaryLeagueCard({ onPress }: { onPress?: () => void }) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const { memberId } = usePrimaryMember();
  const { data: primaryLeagueSummary, isPending } = useMemberLeagueSummary(memberId);
  const isRTL = useIsRTL();
  if (isPending) return null;
  if (!primaryLeagueSummary) return null;

  const league = primaryLeagueSummary;

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.replace('/(app)/(league)/(tabs)');
  };

  return (
    <HeaderSection>
      <Pressable onPress={handlePress} className="flex-row gap-6  px-3 py-4">
        {/* Left Content */}
        <View className=" items-center gap-2">
          <View className="flex-row gap-2">
            <Star size={22} color={colors.primary} fill={colors.primary} />

            <Text semibold className="text-primary">
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
                <Text h2 semibold numberOfLines={1}>
                  {league.league_name}
                </Text>

                <Text h3 className="text-muted">
                  {league.nickname}
                </Text>
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
                icon={<Clock3 size={18} color={colors.primary} />}
                label={t('Pending')}
                value={`${league.pending_predictions}`}
              />
            </View>

            <View className="mt-4 h-11 flex-row items-center justify-center rounded-xl border border-primary">
              <Text semibold className="text-primary">
                {t('Enter league')}
              </Text>

              <View
                className="absolute right-3"
                style={{
                  transform: [{ scaleX: isRTL ? -1 : 1 }],
                }}
              >
                <ChevronRight size={26} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </HeaderSection>
  );
}
