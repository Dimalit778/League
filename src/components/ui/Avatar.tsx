import { cn } from '@/lib/nativewind/nativeWind';
import { Image, type ImageSource } from 'expo-image';
import { View, type ViewProps } from 'react-native';
import { Text } from './Text';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy';

export type AvatarProps = ViewProps & {
  source?: ImageSource | string | null;
  fallback?: string;
  accessibilityLabel?: string;
  size?: AvatarSize;
  bordered?: boolean;
  status?: AvatarStatus;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
};

const fallbackVariants: Record<AvatarSize, 'caption' | 'bodySmall' | 'label' | 'subtitle' | 'titleLarge'> = {
  xs: 'caption',
  sm: 'bodySmall',
  md: 'label',
  lg: 'subtitle',
  xl: 'titleLarge',
};

const statusClasses: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-muted',
  busy: 'bg-error',
};

export function Avatar({
  source,
  fallback = '?',
  accessibilityLabel = 'Avatar',
  size = 'md',
  bordered = false,
  status,
  className,
  ...props
}: AvatarProps) {
  const imageSource = typeof source === 'string' ? { uri: source } : source;
  const initials = fallback
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

  return (
    <View
      {...props}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'relative items-center justify-center rounded-full bg-surfaceSoft',
        sizeClasses[size],
        bordered && 'border-2 border-borderStrong',
        className,
      )}
    >
      <View className="h-full w-full overflow-hidden rounded-full items-center justify-center">
        {imageSource ? (
          <Image source={imageSource} contentFit="cover" cachePolicy="memory-disk" style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text variant={fallbackVariants[size]} className="font-semibold">
            {initials}
          </Text>
        )}
      </View>
      {status ? (
        <View
          accessibilityLabel={status}
          className={cn(
            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface',
            statusClasses[status],
          )}
        />
      ) : null}
    </View>
  );
}
