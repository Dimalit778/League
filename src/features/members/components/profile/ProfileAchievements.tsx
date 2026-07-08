import { Text } from '@/components/ui';
import { MemberStatsType } from '@/features/members/types';
import { useTranslation } from '@/hooks/useTranslation';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Crosshair, Trophy } from 'lucide-react-native';
import { View } from 'react-native';

const GOLD = '#E3B421';

type Achievement = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <View
      className="flex-1 overflow-hidden rounded-2xl border border-[#223554] bg-[#101A2A]"
      style={{ opacity: achievement.unlocked ? 1 : 0.45 }}
    >
      <LinearGradient
        colors={['rgba(227,180,33,0.12)', 'rgba(227,180,33,0.02)']}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View className="items-center px-2 py-4">
        <View className="mb-2 h-12 w-12 items-center justify-center rounded-xl border border-[#D5B13F]/30 bg-[#1A2740]">
          {achievement.icon}
        </View>
        <Text className="text-center text-sm font-bold text-white">{achievement.title}</Text>
        <Text className="mt-1 text-center text-[10px] leading-4 text-[#97A7BF]">{achievement.description}</Text>
      </View>
    </View>
  );
}

function buildAchievements(stats: MemberStatsType | undefined, t: (key: string, params?: Record<string, string | number>) => string): Achievement[] {
  const position = stats?.position ?? null;
  const totalPredictions = stats?.totalPredictions ?? 0;
  const correctPredictions = (stats?.bingoHits ?? 0) + (stats?.regularHits ?? 0);

  return [
    {
      id: 'top10',
      icon: <Trophy size={22} color={GOLD} />,
      title: t('Top 10'),
      description: t('Reached top 10 in the table'),
      unlocked: position != null && position <= 10,
    },
    {
      id: 'consistent',
      icon: <Award size={22} color={GOLD} />,
      title: t('Consistent'),
      description: t('{{count}} matches played', { count: totalPredictions }),
      unlocked: totalPredictions >= 7,
    },
    {
      id: 'predictor',
      icon: <Crosshair size={22} color={GOLD} />,
      title: t('Predictor'),
      description: t('{{count}} correct predictions', { count: correctPredictions }),
      unlocked: correctPredictions >= 50,
    },
  ];
}

type ProfileAchievementsProps = {
  stats?: MemberStatsType;
};

export function ProfileAchievements({ stats }: ProfileAchievementsProps) {
  const { t } = useTranslation();
  const achievements = buildAchievements(stats, t);

  return (
    <View className="mx-3 mt-5">
      <Text className="mb-3 text-base font-bold text-white">{t('Your achievements')}</Text>
      <View className="flex-row gap-2">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </View>
    </View>
  );
}
