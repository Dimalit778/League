import { Text } from '@/components/ui';
import { MemberStats as MemberStatsType } from '@/features/members/types/stats.type';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart3, Crosshair, Star, Target, XCircle } from 'lucide-react-native';
import { View } from 'react-native';

const GOLD = '#E3B421';
const SUCCESS = '#34D399';
const ERROR = '#F87171';

type StatCellProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  showDivider?: boolean;
};

function StatCell({ icon, label, value, showDivider = true }: StatCellProps) {
  return (
    <>
      <View className="flex-1 items-center px-0.5">
        {icon}
        <Text variant="caption" className="mt-0.5 uppercase tracking-wide text-muted" numberOfLines={2}>
          {label}
        </Text>
        <Text variant="bodySmall" className="font-bold text-white" numberOfLines={1}>
          {value}
        </Text>
      </View>
      {showDivider ? <View className="w-px self-stretch bg-[#223554]" /> : null}
    </>
  );
}

type StatsProps = {
  stats?: MemberStatsType;
};

export function Stats({ stats }: StatsProps) {
  const { t } = useTranslation();

  const rank = stats?.rank ? `#${stats.rank}` : '—';
  const points = stats?.totalPoints ?? '—';

  return (
    <View className="flex-1 gap-3 px-4">
      <View className="flex-1 flex-row rounded-2xl border border-border bg-background/60 py-2">
        <StatCell icon={<BarChart3 size={12} color={GOLD} />} label={t('Rank')} value={rank} />
        <StatCell icon={<Star size={12} color={GOLD} fill={GOLD} />} label={t('pts')} value={points} />
        <StatCell icon={<Crosshair size={12} color={SUCCESS} />} label={t('Bingo')} value={stats?.bingoHits ?? 0} />
        <StatCell icon={<Target size={12} color={GOLD} />} label={t('Hits')} value={stats?.regularHits ?? 0} />
        <StatCell
          icon={<XCircle size={12} color={ERROR} />}
          label={t('Missed')}
          value={stats?.missedHits ?? 0}
          showDivider={false}
        />
      </View>
    </View>
  );
}
