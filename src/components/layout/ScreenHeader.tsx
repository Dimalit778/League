import { cn } from '@/lib/nativewind/nativeWind';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenHeaderProps = {
  /** Leading content (title, back button). Takes the remaining width. */
  left?: ReactNode;
  /** Centred content, absolutely positioned so it stays centred regardless of the sides. */
  center?: ReactNode;
  /** Trailing action(s). */
  right?: ReactNode;
  className?: string;
};

export function ScreenHeader({ left, center, right, className }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className={cn('w-full bg-background px-4 pb-2', className)} style={{ paddingTop: insets.top }}>
      <View className="relative mx-auto h-12 w-full max-w-[720px] flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center">{left}</View>

        {center ? (
          <View className="absolute inset-0 items-center justify-center" style={{ pointerEvents: 'box-none' }}>
            {center}
          </View>
        ) : null}

        <View className="flex-row items-center justify-end">{right}</View>
      </View>
    </View>
  );
}
