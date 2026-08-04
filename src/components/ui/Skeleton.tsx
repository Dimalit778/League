import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useEffect } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Card } from './Card';

export function Skeleton({ className, style }: { className?: string; style?: StyleProp<ViewStyle> }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // ponytail: Reanimated Animated.View drops NativeWind sizing on web — keep layout on a plain View
  return (
    <Animated.View testID="skeleton-pulse" style={animatedStyle}>
      <View
        testID="skeleton-bone"
        accessibilityRole="progressbar"
        className={cn('rounded-md bg-border', className)}
        style={style}
      />
    </Animated.View>
  );
}

export function TextSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-4 ', className)} />;
}

function AvatarSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-11 w-11 rounded-full', className)} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} accessibilityLabel={t('Loading card')}>
      <View className={spacing.list}>
        <TextSkeleton className="h-5 w-12" />
        <TextSkeleton />
        <TextSkeleton />
      </View>
    </Card>
  );
}
export function BoxSkeleton({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card padding="lg" className={className} accessibilityLabel={t('Loading card')}>
      <Skeleton className={cn('h-28 w-full', className)} />
    </Card>
  );
}

export function MatchCardSkeleton({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} accessibilityLabel={t('Loading match')}>
      <View className="flex-row items-center justify-between">
        <View className={cn('items-center', spacing.row)}>
          <AvatarSkeleton />
          <TextSkeleton className="w-16" />
        </View>
        <TextSkeleton className="h-8 w-14" />
        <View className={cn('items-center', spacing.row)}>
          <AvatarSkeleton />
          <TextSkeleton className="w-16" />
        </View>
      </View>
    </Card>
  );
}
