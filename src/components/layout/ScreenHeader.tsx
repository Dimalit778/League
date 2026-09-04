import { TrophyIcon } from '@/assets/icons';
import { Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabButton } from '../ui/TabButton';

type ScreenHeaderProps = {
  left?: ReactNode;
  /** Centered title. A string is wrapped in `Text`; any other node is rendered as-is. */
  center?: ReactNode;
  /** Alias for a string `center`. Ignored when `center` is set. */
  title?: string;
  right?: ReactNode;
  className?: string;
};

export function ScreenHeader({ left, center, title, right, className }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const centerContent = center ?? title;

  return (
    <View className={cn('w-full bg-background pb-2 px-4', className)} style={{ paddingTop: insets.top }}>
      <View className="relative mx-auto h-12 w-full max-w-[720px] flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center">{left}</View>

        {centerContent != null && centerContent !== '' ? (
          <View className="absolute inset-0 items-center justify-center px-14" style={{ pointerEvents: 'box-none' }}>
            {typeof centerContent === 'string' ? (
              <Text variant="title" numberOfLines={1} className="text-center">
                {t(centerContent)}
              </Text>
            ) : (
              centerContent
            )}
          </View>
        ) : null}

        <View className="absolute end-0 top-0" style={{ pointerEvents: 'box-none' }}>
          {right ?? (
            <TabButton href="/(app)/(user)/leagues/my-leagues" icon={TrophyIcon} accessibilityLabel={t('My Leagues')} />
          )}
        </View>
      </View>
    </View>
  );
}
