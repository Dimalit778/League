import { DirectionalIcon, Card, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { router, type Href } from 'expo-router';
import { ChartNoAxesCombined, Goal, Podium, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

type Props = {
  title: string;
  icon: LucideIcon;
  href: Href;
};

function QuickAccessItem({ title, icon: Icon, href }: Props) {
  const { colors } = useThemeTokens();

  return (
    <Card
      variant="interactive"
      padding="sm"
      className="flex-1"
      contentClassName="min-h-24 justify-between"
      accessibilityLabel={title}
      onPress={() => router.push(href)}
    >
      <Icon size={24} color={colors.primary} strokeWidth={2} />
      <View className={cn('flex-row items-center', spacing.inline)}>
        <Text variant="bodySmall" tone="secondary" numberOfLines={1} className="min-w-0 flex-1">
          {title}
        </Text>
        <DirectionalIcon size={16} color={colors.muted} strokeWidth={2} />
      </View>
    </Card>
  );
}

export function QuickAccessSection() {
  const { t } = useTranslation();

  return (
    <View className={cn('flex-row', spacing.list)}>
      <QuickAccessItem
        title={t('Matches')}
        icon={Goal}
        href="/(app)/(league)/(tabs)/Matches"
      />
      <QuickAccessItem
        title={t('Leaderboard')}
        icon={Podium}
        href="/(app)/(league)/(tabs)/Leaderboard"
      />
      <QuickAccessItem
        title={t('Stats')}
        icon={ChartNoAxesCombined}
        href="/(app)/(league)/(tabs)/Profile"
      />
    </View>
  );
}
