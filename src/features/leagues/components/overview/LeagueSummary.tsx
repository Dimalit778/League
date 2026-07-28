import { TopTabBar } from '@/components/layout';
import { AvatarImage, HeaderBackground, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Award, Star, Users } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeagueOverviewSummary } from '../../types';

function Divider() {
  return <View className="mx-0.5 h-14 w-px self-center bg-border opacity-70" />;
}

function StatColumn({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueSuffix?: string;
}) {
  return (
    <View className="w-[52px] items-center justify-center gap-0.5">
      {icon}

      <Text className="text-muted text-xs" numberOfLines={1}>
        {label}
      </Text>

      <View className="flex-row items-baseline gap-0.5">
        <Text numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

export default function LeagueSummary({ leagueSummary }: { leagueSummary: LeagueOverviewSummary }) {
  const { nickname, avatarUrl, leagueName, rank, points, membersCount } = leagueSummary;
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <HeaderBackground>
      <View style={{ paddingTop: insets.top }} className="px-4 pb-4">
        <TopTabBar className="mb-3" />

        <View className="mt-2 rounded-lg border border-border px-1.5 py-4">
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center gap-2">
              <View className="h-14 w-14 rounded-full border-2 border-primary p-0.5">
                <AvatarImage nickname={nickname} path={avatarUrl} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-2xl font-bold" numberOfLines={1}>
                  {nickname}
                </Text>
                <Text className="text-base text-muted" numberOfLines={1}>
                  {leagueName}
                </Text>
              </View>
            </View>

            <Divider />

            <StatColumn
              icon={<Star size={18} color={colors.primary} strokeWidth={2} />}
              label={t('Rank')}
              value={rank > 0 ? `#${rank}` : '—'}
            />

            <Divider />

            <StatColumn
              icon={<Award size={18} color={colors.primary} strokeWidth={2} />}
              label={t('Points')}
              value={String(points)}
              valueSuffix={t('pts')}
            />

            <Divider />

            <StatColumn
              icon={<Users size={18} color={colors.primary} strokeWidth={2} />}
              label={t('Members')}
              value={String(membersCount)}
            />
          </View>
        </View>
      </View>
    </HeaderBackground>
  );
}
