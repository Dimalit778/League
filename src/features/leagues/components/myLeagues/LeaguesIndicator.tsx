import { HeaderChrome, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type LeaguesIndicatorProps = {
  used: number;
  limit: number;
};

export default function LeaguesIndicator({ used, limit }: LeaguesIndicatorProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <HeaderChrome>
      <View className="w-full flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-4">
          <Text variant="header" numberOfLines={1} className="shrink">
            {t('My Leagues')}
          </Text>
          <View className="rounded-md bg-subtle px-3 py-1">
            <Text variant="label" tone="muted" className="font-bold">
              {used}/{limit}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(app)/(user)/settings')}
          accessibilityRole="button"
          accessibilityLabel={t('Settings')}
          className="h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-subtle"
          hitSlop={4}
          style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
        >
          <Settings size={23} strokeWidth={1.5} color={colors.text} />
        </Pressable>
      </View>
    </HeaderChrome>
  );
}
