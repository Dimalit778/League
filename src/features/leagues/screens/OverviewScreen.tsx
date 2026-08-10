import { images } from '@/assets/images';
import { ArrowIcon, CollapsibleHeader, Section } from '@/components';
import { StatsPredictionSection } from '@/features/members/components/stats/StatsPredictionSection';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { View } from 'react-native';
import { CurrentFormCard } from '../components/overview/CurrentFormCard';
import { CollapsedHeader, ExpandedHeader } from '../components/overview/Header';
import LeagueSummary from '../components/overview/LeagueSummary';
import OverviewSkeleton from '../components/overview/OverviewSkeleton';
import { UpcomingMatches } from '../components/overview/Upcoming-matches';
import { useLeagueOverview } from '../hooks/useLeagueOverview';

export default function OverviewScreen() {
  const { leagueSummary, stats, upcomingMatches, isLoading } = useLeagueOverview();
  const memberId = useMemberId();

  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  if (isLoading) return <OverviewSkeleton />;

  return (
    <CollapsibleHeader
      backgroundImage={images.stadium}
      expandedHeight={260}
      collapsedHeight={48}
      overlap={50}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
      expandedHeader={<ExpandedHeader nickname={leagueSummary.nickname} logoUrl={leagueSummary.logoUrl} />}
      collapsedHeader={<CollapsedHeader nickname={leagueSummary.nickname} logoUrl={leagueSummary.logoUrl} />}
    >
      <View className="gap-6">
        <LeagueSummary leagueSummary={leagueSummary} />

        <Section title={t('Current form')} accent>
          <CurrentFormCard results={stats.recentForm} />
        </Section>
        <Section
          title={t('Stats')}
          accent
          actionIcon={<ArrowIcon size={20} color={colors.text} />}
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

        <Section title={t('Today matches')} accent>
          <UpcomingMatches matches={upcomingMatches} />
        </Section>
      </View>
    </CollapsibleHeader>
  );
}
