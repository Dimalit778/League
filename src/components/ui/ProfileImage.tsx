import { useMemberAvatar } from '@/hooks/useMembers';
import { cn } from '@/lib/nativewind/utils';
import { ComponentProps, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ProfileImageProps = {
  path?: string | null;
  imageUrl?: string | null;
  memberId?: string;
  nickname?: string | null;
  size?: AvatarSize;
  className?: string;
  imageClassName?: string;
  containerClassName?: string;
  fetchOptions?: {
    width?: number;
    height?: number;
    quality?: number;
    resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    expiresIn?: number;
  };
  showActivityIndicator?: boolean;
  showInitialFallback?: boolean;
} & Omit<ComponentProps<typeof Image>, 'source'>;

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 32,
  sm: 40,
  md: 72,
  lg: 120,
  xl: 160,
};

const getDimension = (
  size: AvatarSize | undefined,
  style: ComponentProps<typeof Image>['style']
) => {
  const extractWidth = (value: unknown) => {
    if (
      value &&
      typeof value === 'object' &&
      'width' in (value as Record<string, unknown>)
    ) {
      const width = (value as Record<string, unknown>).width;
      return typeof width === 'number' ? width : Number(width);
    }
    return undefined;
  };

  if (style) {
    if (Array.isArray(style)) {
      for (const entry of style) {
        const width = extractWidth(entry);
        if (width) {
          return width;
        }
      }
    } else if (typeof style === 'object') {
      const width = extractWidth(style);
      if (width) {
        return width;
      }
    }
  }

  return size ? SIZE_MAP[size] : SIZE_MAP.md;
};

const ProfileImage = ({
  path,
  imageUrl,
  memberId,
  nickname,
  size = 'md',
  className,
  imageClassName,
  containerClassName,
  fetchOptions,
  showActivityIndicator = true,
  showInitialFallback = true,
  style,
  onLoad,
  onLoadEnd,
  ...imageProps
}: ProfileImageProps) => {
  const dimension = useMemo(() => getDimension(size, style), [size, style]);

  const {
    data: remoteAvatarUrl,
    isFetching,
    isLoading,
  } = useMemberAvatar(
    memberId,
    path,
    fetchOptions ?? {
      width: dimension,
      height: dimension,
      resize: 'cover',
      quality: 80,
    }
  );

  const resolvedSource = imageUrl ?? remoteAvatarUrl ?? undefined;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const initial = nickname?.charAt(0)?.toUpperCase() ?? '?';

  const radius = dimension / 2 || 36;
  const fallbackFontSize = Math.max(
    12,
    Math.min((dimension ?? SIZE_MAP.md) * 0.45, 42)
  );

  const handleLoad: ComponentProps<typeof Image>['onLoad'] = (event) => {
    setIsImageLoaded(true);
    onLoad?.(event);
  };

  const handleLoadEnd: ComponentProps<typeof Image>['onLoadEnd'] = () => {
    setIsImageLoaded(true);
    onLoadEnd?.();
  };

  const showLoader =
    showActivityIndicator && (isFetching || isLoading) && !isImageLoaded;
  const showBaseFallback = showInitialFallback && !resolvedSource;
  const showOverlayFallback =
    showInitialFallback && resolvedSource !== undefined && !isImageLoaded;

  return (
    <View
      className={cn(
        'relative overflow-hidden rounded-full bg-background border border-border items-center justify-center',
        className,
        containerClassName
      )}
      style={{ width: dimension, height: dimension }}
    >
      {resolvedSource ? (
        <Image
          source={{ uri: resolvedSource }}
          className={cn('w-full h-full', imageClassName)}
          style={[{ borderRadius: radius }, style]}
          onLoad={handleLoad}
          onLoadEnd={handleLoadEnd}
          {...imageProps}
        />
      ) : null}

      {showBaseFallback && (
        <View
          className={cn(
            'absolute inset-0 w-full h-full items-center justify-center',
            imageClassName
          )}
        >
          <Text
            className="text-primary font-semibold"
            style={{ fontSize: fallbackFontSize }}
          >
            {initial}
          </Text>
        </View>
      )}

      {showOverlayFallback && (
        <View className="absolute inset-0 items-center justify-center">
          <Text
            className="text-primary font-semibold"
            style={{ fontSize: fallbackFontSize }}
          >
            {initial}
          </Text>
        </View>
      )}

      {showLoader && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="small" color="#9ca3af" />
        </View>
      )}
    </View>
  );
};

export default ProfileImage;
