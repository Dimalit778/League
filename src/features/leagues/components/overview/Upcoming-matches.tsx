import { EmptyState } from '@/components';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { type MatchCardData } from '@/features/matches/utils/matchCard.mapper';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { CalendarDays } from 'lucide-react-native';
import { View } from 'react-native';

export function UpcomingMatches({ matches }: { matches: MatchCardData[] }) {
  const { t } = useTranslation();

  if (matches.length === 0) {
    return <EmptyState icon={CalendarDays} title={t('No matches today')} className="rounded-2xl bg-surface" />;
  }

  return (
    <View className={spacing.list}>
      {matches.map((item) => (
        <MatchCard key={item.id} {...item} />
      ))}
    </View>
  );
}
