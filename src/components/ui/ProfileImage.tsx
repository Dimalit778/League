import { downloadImage } from '@/hooks/useSupabaseImages';
import { ComponentProps, useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { LoadingOverlay } from '../layout';

type ProfileImageProps = {
  path: string;
  nickname: string;
  className?: string;
} & ComponentProps<typeof Image>;

const ProfileImage = ({
  path,
  nickname,
  className,
  ...imageProps
}: ProfileImageProps) => {
  const [avatarImage, setAvatarImage] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  const handleDownloadImage = async () => {
    const image = await downloadImage(path);
    setAvatarImage(image as string);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    if (path) {
      handleDownloadImage();
    } else {
      setLoading(false);
    }
  }, [path]);

  if (loading)
    return (
      <View
        className={className}
        style={{ borderRadius: 30, overflow: 'hidden' }}
      >
        <LoadingOverlay />
      </View>
    );

  return (
    <View>
      {avatarImage ? (
        <View className={className}>
          <Image
            source={{ uri: avatarImage }}
            style={{ width: '100%', height: '100%', borderRadius: 20 }}
            {...imageProps}
          />
        </View>
      ) : (
        <View
          className="rounded-full bg-background border border-border items-center justify-center"
          {...imageProps}
        >
          <Text className="text-primary font-bold">
            {nickname?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ProfileImage;
