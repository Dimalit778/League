import { cn } from '@/lib/nativewind/nativeWind';
import { ImageContentFit } from 'expo-image';
import { View } from 'react-native';
import { MyImage } from './MyImage';

type Src = string | number | { uri: string; headers?: Record<string, string> };

const LOGO_BACKDROP = '#D8E1EA';

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
  backgroundColor = LOGO_BACKDROP,
  className,
  contentFit = 'fill',
}: LogoBadgeProps) => {
  return (
    <View
      className={cn('items-center justify-center overflow-hidden rounded-md border border-border', className)}
      style={{ width, height, backgroundColor }}
    >
      <MyImage source={source} width={width} height={height} contentFit={contentFit} />
    </View>
  );
};
