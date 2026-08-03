import { Text } from '@/components/ui/Text';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage, ImageStyle } from 'expo-image';
import { View } from 'react-native';
import { LoadingOverlay } from '../layout/LoadingOverlay';

type AvatarImageProps = {
  nickname?: string | null;
  /** Storage path under profile_images (preferred). */
  path?: string | null;
  /** Alias for path — same storage path, not a full URL. */
  src?: string | null;
  style?: ImageStyle;
  className?: string;
  loading?: boolean;
};

export const AvatarImage = ({ nickname, path, src, style, className, loading }: AvatarImageProps) => {
  const { t } = useTranslation();
  const initial = nickname?.charAt(0)?.toUpperCase() ?? '?';
  const profileImage = getProfileImage(path ?? src);

  return (
    <View
      className={cn(
        'w-full h-full items-center justify-center bg-surface border border-border rounded-full overflow-hidden',
        className,
      )}
    >
      {loading && <LoadingOverlay />}
      {profileImage ? (
        <ExpoImage
          source={{ uri: profileImage }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
          priority="high"
          style={[{ width: '100%', height: '100%', borderRadius: 9999 }, style]}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={nickname ? t('{{name}} profile picture', { name: nickname }) : t('User profile picture')}
        />
      ) : (
        <View
          className="items-center justify-center"
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={
            nickname
              ? t('{{name}} profile placeholder, {{initial}}', { name: nickname, initial })
              : t('User profile placeholder, {{initial}}', { initial })
          }
        >
          <Text className="font-semibold">{initial}</Text>
        </View>
      )}
    </View>
  );
};
