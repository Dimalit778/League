import { LoadingOverlay } from '@/components/layout';
import { downloadImage } from '@/hooks/useSupabaseImages';
import { ComponentProps, useEffect, useState } from 'react';
import { Image, View } from 'react-native';

type SupabaseImageProps = {
  path: string;
} & ComponentProps<typeof Image>;

const SupabaseImage = ({ path, ...imageProps }: SupabaseImageProps) => {
  const [image, setImage] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  const handleDownloadImage = async () => {
    const image = await downloadImage(path);
    setImage(image as string);
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
      <View className="w-full h-full">
        <LoadingOverlay />
      </View>
    );

  return <Image source={{ uri: image }} {...imageProps} />;
};

export default SupabaseImage;
