import { images } from '@/assets/images';
import { ArrowIcon, CollapsibleHeader, Section } from '@/components';
import { StatsPredictionSection } from '@/features/members/components/stats/StatsPredictionSection';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing } from '@/lib/nativewind/spacing';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { router } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { CurrentFormCard } from '../components/overview/CurrentFormCard';
import { CollapsedHeader, ExpandedHeader, PersistentHeaderActions } from '../components/overview/Header';
import LeagueSummary from '../components/overview/LeagueSummary';
import OverviewSkeleton from '../components/overview/OverviewSkeleton';
import { TodayMatches } from '../components/overview/TodayMatches';
import { useLeagueOverview } from '../hooks/useLeagueOverview';

export default function OverviewScreen() {
  const { leagueSummary, stats, todayMatches, isLoading } = useLeagueOverview();
  console.log('leagueSummary', JSON.stringify(leagueSummary, null, 2));
  const { leagueName, competitionName } = leagueSummary;
  const memberId = useMemberId();
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const expandedHeight = 260 + Math.max(0, Math.min(fontScale, 2) - 1) * 80;

  if (isLoading) return <OverviewSkeleton />;

  return (
    <CollapsibleHeader
      backgroundImage={images.stadium}
      expandedHeight={expandedHeight}
      collapsedHeight={48}
      overlap={100}
      expandedHeader={<ExpandedHeader nickname={leagueSummary.nickname} />}
      collapsedHeader={<CollapsedHeader />}
      persistentHeader={
        <PersistentHeaderActions
          flagUrl={leagueSummary.flagUrl}
          leagueName={leagueName}
          competitionName={competitionName}
        />
      }
    >
      <View className={spacing.section} style={{ width: '100%', maxWidth: 720, alignSelf: 'center' }}>
        <LeagueSummary leagueSummary={leagueSummary} />

        <TodayMatches matches={todayMatches} />

        <Section title={t('Current form')} accent className={spacing.screen}>
          <CurrentFormCard results={stats.recentForm} />
        </Section>
        <Section
          title={t('Stats')}
          accent
          className={spacing.screen}
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
