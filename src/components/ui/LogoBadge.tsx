import { ImageContentFit } from 'expo-image';
import { View } from 'react-native';
import { MyImage } from './MyImage';

type Src = string | number | { uri: string; headers?: Record<string, string> };

interface LogoBadgeProps {
  source: Src;
  width: number;
  height: number;
  backgroundColor?: string;
  className?: string;
  contentFit?: ImageContentFit;
}

export const LogoBadge = ({
  source,
  width = 40,
  height = 40,
  className = '',
  contentFit = 'cover',
}: LogoBadgeProps) => {
  return (
    <View className={` rounded-md items-center justify-center ${className}`} style={{ width, height }}>
      <MyImage source={source} width={width * 0.9} height={height * 0.9} contentFit={contentFit} />
    </View>
  );
};
