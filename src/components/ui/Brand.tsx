import { images } from '@/assets/images';
import { Image } from 'expo-image';
import { useWindowDimensions } from 'react-native';

type AppBrandProps = {
  size?: 'sm' | 'md' | 'lg';
  onBoarding?: boolean;
};

const sizes = {
  sm: 120,
  md: 200,
  lg: 250,
} as const;

export const Brand = ({ size = 'md', onBoarding = false }: AppBrandProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const baseWidth = sizes[size];
  const width = screenWidth >= 900 ? baseWidth * 1.75 : screenWidth >= 600 ? baseWidth * 1.35 : baseWidth;

  return (
    <Image
      source={onBoarding ? images.brandOnBoarding : images.brand}
      style={{
        width,
        aspectRatio: 3.5,
        alignSelf: 'center',
      }}
      contentFit="contain"
    />
  );
};
