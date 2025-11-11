import { LoadingOverlay } from '@/components/layout';
import { downloadImage } from '@/hooks/useSupabaseImages';
import { ComponentProps, useEffect, useState } from 'react';
import { Image, View } from 'react-native';

type SupabaseImageProps = {
  path: string;
  accessibilityLabel?: string;
} & ComponentProps<typeof Image>;

const SupabaseImage = ({ path, accessibilityLabel, ...imageProps }: SupabaseImageProps) => {
  const [image, setImage] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  console.log('path', path);

  const handleDownloadImage = async () => {
    const result = await downloadImage(path);
    setImage(result ?? undefined);
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

  return (
    <Image 
      source={{ uri: image }} 
      {...imageProps}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || 'Image'}
    />
  );
};

export default SupabaseImage;
