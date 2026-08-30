import { Text } from '@/components';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';

type Position = 1 | 2 | 3;

type MetalStops = { light: string; mid: string; dark: string; rim: string };

const METAL: Record<Position, MetalStops> = {
  1: { light: '#FFE9A8', mid: '#F5C24B', dark: '#B9831F', rim: '#FFF4CE' },
  2: { light: '#F1F4F9', mid: '#C2CAD6', dark: '#889283', rim: '#FFFFFF' },
  3: { light: '#E9BD92', mid: '#CE8E52', dark: '#8F5A2C', rim: '#F5D3B4' },
};

export function PodiumHexBadge({ position, size = 34 }: { position: Position; size?: number }) {
  const m = METAL[position];
  const w = size;
  const h = size * 0.9;
  const hex = `${w * 0.25},0 ${w * 0.75},0 ${w},${h * 0.5} ${w * 0.75},${h} ${w * 0.25},${h} 0,${h * 0.5}`;
  const sheen = `${w * 0.25},0 ${w * 0.75},0 ${w},${h * 0.5} 0,${h * 0.5}`;
  const fillId = `hexFill-${position}`;
  const sheenId = `hexSheen-${position}`;

  return (
    <View
      style={{
        width: w,
        height: h,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={m.light} />
            <Stop offset="0.5" stopColor={m.mid} />
            <Stop offset="1" stopColor={m.dark} />
          </LinearGradient>
          <LinearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Polygon points={hex} fill={`url(#${fillId})`} stroke={m.rim} strokeWidth={1.25} strokeLinejoin="round" />
        <Polygon points={sheen} fill={`url(#${sheenId})`} />
      </Svg>
      <Text allowFontScaling={false} className="font-manrope-bold text-[16px] text-[#1A1205]">
        {position}
      </Text>
    </View>
  );
}

/** Golden crown with gradient, jewels, rim light and a soft glow. */
export function PodiumCrown({ size = 40 }: { size?: number }) {
  const m = METAL[1];
  const w = size;
  const h = size * 0.9;

  const crown = 'M4 27 L4 12 L13.5 18 L20 5 L26.5 18 L36 12 L36 27 Z';

  return (
    <View
      style={{
        width: w,
        height: h,
      }}
    >
      <Svg width={w} height={h} viewBox="0 6 48 30">
        <Defs>
          <LinearGradient id="crownFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={m.light} />
            <Stop offset="0.55" stopColor={m.mid} />
            <Stop offset="1" stopColor={m.dark} />
          </LinearGradient>
        </Defs>
        <Path d={crown} fill="url(#crownFill)" stroke={m.rim} strokeWidth={1.2} strokeLinejoin="round" />
        <Circle cx="20" cy="5" r="2.6" fill={m.rim} />
        <Circle cx="4.5" cy="11.5" r="2.2" fill={m.rim} />
        <Circle cx="35.5" cy="11.5" r="2.2" fill={m.rim} />
      </Svg>
    </View>
  );
}
