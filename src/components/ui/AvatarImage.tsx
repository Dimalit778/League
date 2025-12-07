import { CText } from '@/components/ui/CText';
import { cn } from '@/lib/nativeWind';
import { getProfileImage } from '@/utils/getProfileImage';
import { Image as ExpoImage, ImageStyle } from 'expo-image';
import { View } from 'react-native';

type AvatarImageProps = {
  nickname?: string | null;
  path?: string | null;
  style?: ImageStyle;
  className?: string;
};

const AvatarImage = ({ nickname, path, style, className }: AvatarImageProps) => {
  const initial = nickname?.charAt(0)?.toUpperCase() ?? '?';
  const profileImage = getProfileImage(path);

  return (
    <View
      className={cn(
        'w-full h-full items-center justify-center bg-surface border border-border rounded-full overflow-hidden',
        className
      )}
    >
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
          accessibilityLabel={nickname ? `${nickname}'s avatar` : 'User avatar'}
        />
      ) : (
        <View
          className="items-center justify-center"
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={nickname ? `${nickname}'s avatar initial ${initial}` : `Avatar initial ${initial}`}
        >
          <CText className="text-primary font-semibold text-2xl">{initial}</CText>
        </View>
      )}
    </View>
  );
};

export default AvatarImage;
