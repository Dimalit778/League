import { Card, Row, Section, Text } from '@/components';
import { MemberStats as MemberStatsType } from '@/features/members/types/stats.type';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Award, Crosshair, Trophy } from 'lucide-react-native';
import { View } from 'react-native';

type Achievement = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Card
      padding="none"
      variant="outlined"
      className="flex-1"
      style={{ opacity: achievement.unlocked ? 1 : 0.5 }}
      accessible
      accessibilityLabel={`${achievement.title}. ${achievement.description}`}
      accessibilityState={{ disabled: !achievement.unlocked }}
    >
      <View className="items-center px-2 py-3">
        <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-subtle">{achievement.icon}</View>
        <Text className="text-center text-sm font-bold text-text">{achievement.title}</Text>
        <Text variant="caption" className="mt-1 text-center text-muted">
          {achievement.description}
        </Text>
      </View>
    </Card>
  );
}

function buildAchievements(
  stats: MemberStatsType | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
  accentColor: string,
): Achievement[] {
  const position = stats?.rank ?? null;
  const totalPredictions = stats?.totalPredictions ?? 0;
  const correctPredictions = (stats?.bingoHits ?? 0) + (stats?.regularHits ?? 0);

  return [
    {
      id: 'top10',
      icon: <Trophy size={20} color={accentColor} />,
      title: t('Top 10'),
      description: t('Reached top 10 in the table'),
      unlocked: position != null && position <= 10,
    },
    {
      id: 'consistent',
      icon: <Award size={20} color={accentColor} />,
      title: t('Consistent'),
      description: t('{{count}} matches played', { count: totalPredictions }),
      unlocked: totalPredictions >= 7,
    },
    {
      id: 'predictor',
      icon: <Crosshair size={20} color={accentColor} />,
      title: t('Predictor'),
      description: t('{{count}} correct predictions', { count: correctPredictions }),
      unlocked: correctPredictions >= 50,
    },
  ];
}

type AchievementsProps = {
  stats?: MemberStatsType;
};

export function Achievements({ stats }: AchievementsProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const achievements = buildAchievements(stats, t, colors.primary);

  return (
    <Section title={t('Your achievements')} contentClassName="gap-2">
      <Row className="gap-2">
        {achievements.map((achievement) => (
          <View key={achievement.id} className="flex-1">
            <AchievementCard achievement={achievement} />
          </View>
        ))}
      </Row>
    </Section>
  );
}
