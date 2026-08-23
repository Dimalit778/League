import { images } from '@/assets/images';
import { ArrowIcon, CollapsibleHeader, Section } from '@/components';
import { StatsPredictionSection } from '@/features/members/components/stats/StatsPredictionSection';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { View } from 'react-native';
import { CurrentFormCard } from '../components/overview/CurrentFormCard';
import { CollapsedHeader, ExpandedHeader, PersistentHeaderActions } from '../components/overview/Header';
import LeagueSummary from '../components/overview/LeagueSummary';
import OverviewSkeleton from '../components/overview/OverviewSkeleton';
import { TodayMatches } from '../components/overview/TodayMatches';
import { useLeagueOverview } from '../hooks/useLeagueOverview';

export default function OverviewScreen() {
  const { leagueSummary, stats, todayMatches, isLoading } = useLeagueOverview();
  const memberId = useMemberId();
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  if (isLoading) return <OverviewSkeleton />;

  return (
    <CollapsibleHeader
      backgroundImage={images.stadium}
      expandedHeight={260}
      collapsedHeight={48}
      overlap={120}
      expandedHeader={<ExpandedHeader nickname={leagueSummary.nickname} />}
      collapsedHeader={<CollapsedHeader nickname={leagueSummary.nickname} />}
      persistentHeader={<PersistentHeaderActions logoUrl={leagueSummary.flagUrl} />}
    >
      <View className="gap-6">
        <LeagueSummary leagueSummary={leagueSummary} />

        <TodayMatches matches={todayMatches} />

        <Section title={t('Current form')} accent className="px-4">
          <CurrentFormCard results={stats.recentForm} />
        </Section>
        <Section
          title={t('Stats')}
          accent
          className="px-4"
          actionIcon={<ArrowIcon size={20} color={colors.text} direction="forward" strokeWidth={2} />}
          onActionPress={() => {
            if (!memberId) return;
            router.push({
              pathname: '/(app)/(league)/member/[memberId]',
              params: { memberId },
            });
          }}
        >
          <StatsPredictionSection stats={stats} />
        </Section>
      </View>
    </CollapsibleHeader>
  );
}
