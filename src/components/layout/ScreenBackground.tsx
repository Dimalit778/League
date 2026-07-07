import { ReactNode } from 'react';
import { ImageBackground, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenBackgroundProps = {
  source: ImageSourcePropType;
  children: ReactNode;
  className?: string;
  imageStyle?: StyleProp<ImageStyle>;
};

export const ScreenBackground = ({ source, children, className = 'flex-1', imageStyle }: ScreenBackgroundProps) => {
  return (
    <ImageBackground source={source} resizeMode="cover" className={className} imageStyle={imageStyle}>
      <SafeAreaView className="flex-1">{children}</SafeAreaView>
    </ImageBackground>
  );
};
