import { Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { router } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useIsRTL } from '@/providers/LanguageProvider';
import { useTranslation } from '@/hooks/useTranslation';

type TopTabBarProps = {
  title?: string;
};

export function TopTabBar({ title }: TopTabBarProps) {
  const { colors } = useThemeTokens();
  const isRTL = useIsRTL();
  const { t } = useTranslation();

  return (
    <View
      className="w-full flex-row items-center justify-between"
      style={{ direction: 'ltr', flexDirection: isRTL ? 'row-reverse' : 'row' }}
    >
      <Text variant="header" numberOfLines={1} className="min-w-0 flex-1">
        {title}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('My leagues')}
        className="h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-subtle"
        hitSlop={4}
        onPress={() => router.replace('/(app)/(user)/leagues/my-leagues')}
      >
        <Trophy color={colors.text} size={23} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}
