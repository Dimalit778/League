import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart3, Calendar, Users } from 'lucide-react-native';
import { View } from 'react-native';

const GOLD = '#E3B421';

type LeaderboardStatsBarProps = {
  membersCount: number;
  gameweek: number;
  yourRank: number | null;
};

function StatItem({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-1 items-center">
      <View className="mb-1 flex-row items-center gap-1.5">
        {icon}
        <CText className={`text-base font-bold ${valueClassName ?? 'text-white'}`}>{value}</CText>
      </View>
      <CText className="text-[10px] uppercase tracking-wide text-[#97A7BF]">{label}</CText>
    </View>
  );
}

export function LeaderboardStatsBar({ membersCount, gameweek, yourRank }: LeaderboardStatsBarProps) {
  const { t } = useTranslation();

  return (
    <View className="mx-3 mb-3 overflow-hidden rounded-2xl border border-[#223554] bg-[#101A2A] px-4 py-3">
      <View className="flex-row items-center">
        <StatItem
          icon={<Users size={14} color={GOLD} />}
          label={t('Members')}
          value={String(membersCount)}
        />
        <View className="mx-2 h-8 w-px bg-[#223554]" />
        <StatItem
          icon={<Calendar size={14} color={GOLD} />}
          label={t('Gameweek')}
          value={String(gameweek)}
        />
        <View className="mx-2 h-8 w-px bg-[#223554]" />
        <StatItem
          icon={<BarChart3 size={14} color={GOLD} />}
          label={t('Your rank')}
          value={yourRank != null ? `#${yourRank}` : '—'}
          valueClassName="text-[#E3B421]"
        />
      </View>
    </View>
  );
}
