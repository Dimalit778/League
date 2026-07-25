import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router, type Href } from 'expo-router';
import { ChartNoAxesCombined, ChevronRight, Goal, Podium } from 'lucide-react-native';
import { View } from 'react-native';

type Props = {
  title: string;
  icon: React.ReactNode;
  href: Href;
};

function QuickAccessItem({ title, icon, href }: Props) {
  const { colors } = useThemeTokens();

  return (
    <Card className="flex-1 p-1.5" contentClassName="flex-row items-center" onPress={() => router.push(href)}>
      <View className="min-w-0 flex-1 gap-1">
        {icon}
        <Text small numberOfLines={1}>
          {title}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.text} strokeWidth={1} />
    </Card>
  );
}

export function QuickAccessSection() {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <Text semibold>{t('Quick access')}</Text>
      <View className="flex-row gap-3">
        <QuickAccessItem
          title={t('Matches')}
          icon={<Goal size={30} color={colors.primary} strokeWidth={1} />}
          href="/(app)/(league)/(tabs)/Matches"
        />
        <QuickAccessItem
          title={t('Leaderboard')}
          icon={<Podium size={30} color={colors.primary} strokeWidth={1} />}
          href="/(app)/(league)/(tabs)/Leaderboard"
        />
        <QuickAccessItem
          title={t('Stats')}
          icon={<ChartNoAxesCombined size={30} color={colors.primary} strokeWidth={1} />}
          href="/(app)/(league)/(tabs)/Profile"
        />
      </View>
    </View>
  );
}
