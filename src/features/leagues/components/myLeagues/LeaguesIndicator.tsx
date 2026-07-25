import { Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { ChevronRight, Settings } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type LeaguesIndicatorProps = {
  used: number;
  limit: number;
  onPress?: () => void;
};

export default function LeaguesIndicator({ used, limit, onPress }: LeaguesIndicatorProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const progress = Math.min(used / limit, 1);
  const settingsHref = '/(app)/(user)/settings';
  return (
    <View className="flex-row items-center gap-4 px-4 ">
      <Pressable
        onPress={() => router.push(settingsHref)}
        accessibilityRole="button"
        accessibilityLabel={t('Settings')}
        className="p-2 items-center justify-center rounded-full bg-surfaceSoft"
        style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
      >
        <Settings size={28} strokeWidth={1.5} color={colors.text} />
      </Pressable>
      <Pressable onPress={onPress} className="flex-1 rounded-2xl bg-surface px-2 py-3">
        <View className="flex-row items-center">
          {/* Content */}
          <View className="flex-1 pe-2 ">
            <View className="flex-row items-center justify-between">
              <Text h3 semibold>
                {t('My Leagues')}
              </Text>

              <Text className="text-muted">
                {used}/{limit}
              </Text>
            </View>

            {/* Progress bar */}
            <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surfaceSoft">
              <View className="h-full rounded-full bg-primary" style={{ width: `${progress * 100}%` }} />
            </View>
          </View>
          <ChevronRight size={28} color={colors.muted} strokeWidth={2} />
          {/* Arrow */}
        </View>
      </Pressable>
    </View>
  );
}
