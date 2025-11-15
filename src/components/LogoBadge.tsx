import MyImage from '@/components/ui/MyImage';
import { View } from 'react-native';

type Src = string | number | { uri: string; headers?: Record<string, string> };

interface LogoBadgeProps {
  source: Src;
  width: number;
  height: number;
  backgroundColor?: string;
  className?: string;
  resizeMode?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const LogoBadge = ({
  source,
  width = 40,
  height = 40,
  className = '',
  resizeMode = 'cover',
}: LogoBadgeProps) => {
  const bgColor = '#E0E7FF';

  return (
    <View
      className={` rounded-md items-center justify-center ${className}`}
      style={{ backgroundColor: bgColor, width, height }}
    >
      <MyImage source={source} width={width * 0.9} height={height * 0.9} resizeMode={resizeMode} />
    </View>
  );
};
