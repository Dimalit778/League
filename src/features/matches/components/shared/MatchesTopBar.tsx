import { Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MatchesTopBar({ center }: { center?: ReactNode }) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="w-full px-4" style={{ paddingTop: insets.top }}>
      <View className="relative w-full justify-center h-12">
        <View className="absolute inset-0 items-center justify-center" pointerEvents="box-none">
          <Text variant="title" numberOfLines={1} className="text-center">
            {t('Matches')}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('My leagues')}
          hitSlop={4}
          onPress={() => router.push('/(app)/(user)/leagues/my-leagues')}
          className="z-10 items-center justify-center rounded-full border border-border bg-subtle active:opacity-70 w-12 h-12"
          style={{
            position: 'absolute',
            end: 0,
            top: 0,
          }}
        >
          <Trophy color={colors.text} size={24} strokeWidth={1.5} />
        </Pressable>
      </View>
    </View>
  );
}
