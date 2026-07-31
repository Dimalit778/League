import { cn } from '@/lib/nativewind/nativeWind';
import { View } from 'react-native';
import { Text } from './Text';
type Props = {
  position: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isCurrentUser?: boolean;
};
export function PositionBadge({ position, className, size = 'md', isCurrentUser }: Props) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };
  return (
    <View className={cn(' rounded-md bg-surfaceSoft items-center justify-center ', sizeClasses[size], className)}>
      <Text className={`text-sm font-semibold ${isCurrentUser ? 'text-primary' : 'text-muted'}`}>{position}</Text>
    </View>
  );
}
