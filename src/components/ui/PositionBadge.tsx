import { cn } from '@/lib/nativeWind';
import { View } from 'react-native';
import { Text } from './Text';
type Props = {
  position: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};
export function PositionBadge({ position, className, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };
  return (
    <View className={cn(' rounded-md bg-surfaceSecondary items-center justify-center ', sizeClasses[size], className)}>
      <Text caption semibold>
        {position}
      </Text>
    </View>
  );
}
