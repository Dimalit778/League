import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { useTranslation } from '@/hooks/useTranslation';
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

  return (
    <Animated.View
      accessibilityRole="progressbar"
      className={cn('rounded-md bg-border', className)}
      style={[style, animatedStyle]}
    />
  );
}

export function TextSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-4 w-32', className)} />;
}

function AvatarSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-11 w-11 rounded-full', className)} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} accessibilityLabel={t('Loading card')}>
      <View className={spacing.list}>
        <TextSkeleton className="h-5 w-2/3" />
        <TextSkeleton className="w-full" />
        <TextSkeleton className="w-4/5" />
      </View>
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
