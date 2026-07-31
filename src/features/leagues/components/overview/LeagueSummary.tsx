import { Row } from '@/components/layout';
import { AvatarImage, Divider, HeaderBackground, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { Award, Star, Users } from 'lucide-react-native';
import { View } from 'react-native';
import { LeagueOverviewSummary } from '../../types';

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className={cn('flex-1 items-center', spacing.inline)}>
      {icon}
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
      <Text variant="subtitle" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function LeagueSummary({ leagueSummary }: { leagueSummary: LeagueOverviewSummary }) {
  const { nickname, avatarUrl, leagueName, rank, points, membersCount } = leagueSummary;
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <HeaderBackground>
      <View className={spacing.card}>
        <Row className={spacing.list}>
          <View className="h-16 w-16 rounded-full border-2 border-border p-0.5">
            <AvatarImage nickname={nickname} path={avatarUrl} />
          </View>
          <View className=" flex-1">
            <Text variant="title" numberOfLines={1}>
              {nickname}
            </Text>
            <Text variant="body" tone="muted" numberOfLines={1}>
              {leagueName}
            </Text>
          </View>
        </Row>

        <Divider className="my-4 bg-muted" />

        <Row className={spacing.row}>
          <Stat
            icon={<Star size={20} color={colors.primary} strokeWidth={1.5} fill={colors.primary} />}
            label={t('Rank')}
            value={rank > 0 ? `#${rank}` : '—'}
          />
          <Divider orientation="vertical" className="h-12 bg-muted" />
          <Stat
            icon={<Award size={20} color={colors.primary} strokeWidth={1.5} />}
            label={t('Points')}
            value={String(points)}
          />
          <Divider orientation="vertical" className="h-12 bg-muted" />
          <Stat
            icon={<Users size={20} color={colors.primary} strokeWidth={1.5} />}
            label={t('Members')}
            value={String(membersCount)}
          />
        </Row>
      </View>
    </HeaderBackground>
  );
}
