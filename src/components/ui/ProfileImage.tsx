import { Text, View } from 'react-native';
import Image from './Image';

type ProfileImageSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const ProfileImage = ({
  imageUrl,
  nickname,
  className,
  size = 'md',
}: {
  imageUrl: string;
  nickname: string;
  className?: string;
  size?: ProfileImageSize;
}) => {
  // Size mappings for container and text
  const sizeClasses = {
    xs: {
      container: 'w-6 h-6',
      text: 'text-xs',
    },
    sm: {
      container: 'w-8 h-8',
      text: 'text-sm',
    },
    md: {
      container: 'w-10 h-10',
      text: 'text-base',
    },
    lg: {
      container: 'w-12 h-12',
      text: 'text-lg',
    },
    xl: {
      container: 'w-16 h-16',
      text: 'text-xl',
    },
  };

  const { container, text } = sizeClasses[size];

  return (
    <>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className={`${container} rounded-full border border-border ${className || ''}`}
        />
      ) : (
        <View
          className={`${container} rounded-full bg-background border border-border items-center justify-center ${className || ''}`}
        >
          <Text className={`text-primary ${text} font-bold`}>
            {nickname?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
    </>
  );
};

export default ProfileImage;
