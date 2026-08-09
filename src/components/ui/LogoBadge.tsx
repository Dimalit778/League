import { cn } from '@/lib/nativewind/nativeWind';
import { ImageContentFit } from 'expo-image';
import { View } from 'react-native';
import { MyImage } from './MyImage';

type Src = string | number | { uri: string; headers?: Record<string, string> };

const LOGO_BACKDROP = '#D8E1EA';

const LOGO_PAD = 3;

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
  contentFit = 'contain',
}: LogoBadgeProps) => {
  const innerWidth = Math.max(width - LOGO_PAD * 2, 0);
  const innerHeight = Math.max(height - LOGO_PAD * 2, 0);

  return (
    <View
      className={cn('items-center justify-center overflow-hidden rounded-md border border-border', className)}
      style={{ width, height, backgroundColor }}
    >
      <MyImage source={source} width={innerWidth} height={innerHeight} contentFit={contentFit} />
    </View>
  );
};
