import { cn } from '@/lib/nativewind/utils';
import { Image as ExpoImage, ImageStyle } from 'expo-image';
import { Text, View } from 'react-native';

type AvatarImageProps = {
  nickname: string;
  imageUri: string | null;

  style?: ImageStyle;

  className?: string;
};

const AvatarImage = ({
  nickname,
  imageUri,

  style,
  className,
}: AvatarImageProps) => {
  const initial = nickname.charAt(0).toUpperCase();

  return (
    <View
      className={cn(
        'w-full h-full items-center justify-center bg-surface border border-border rounded-full',
        className
      )}
    >
      {imageUri ? (
        <ExpoImage
          source={{ uri: imageUri }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
          priority="high"
          style={{ width: '100%', height: '100%' }}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={`${nickname}'s avatar`}
        />
      ) : (
        <View 
          className="items-center justify-center"
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${nickname}'s avatar initial ${initial}`}
        >
          <Text className="text-primary font-semibold text-2xl">{initial}</Text>
        </View>
      )}
    </View>
  );
};

export default AvatarImage;
