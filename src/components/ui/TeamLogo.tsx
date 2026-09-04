import { useThemeTokens } from '@/hooks/useThemeTokens';
import { setColorAlpha } from '@/lib/color';
import { LinearGradient } from 'expo-linear-gradient';
import { useId } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

/** `clubColors` arrives from football-data as names, e.g. "Claret / Sky Blue". */
const CLUB_COLOR_HEX: Record<string, string> = {
  white: '#F5F7FA',
  black: '#15181D',
  grey: '#9CA3AF',
  gray: '#9CA3AF',
  silver: '#CBD5E1',
  red: '#DC2626',
  crimson: '#B4133C',
  claret: '#7A263A',
  maroon: '#7B1F26',
  bordeaux: '#6B1F2E',
  brown: '#8B5A2B',
  orange: '#F97316',
  yellow: '#FACC15',
  gold: '#D6A21E',
  beige: '#E4D5B7',
  green: '#16A34A',
  turquoise: '#14B8A6',
  blue: '#2563EB',
  'sky blue': '#38BDF8',
  'light blue': '#38BDF8',
  'royal blue': '#1D4ED8',
  'navy blue': '#1E3A8A',
  navy: '#1E3A8A',
  purple: '#7E22CE',
  violet: '#8B5CF6',
  pink: '#EC4899',
};

const FALLBACK_PALETTE = ['#2563EB', '#DC2626', '#16A34A', '#7E22CE', '#0EA5E9', '#F97316'];
const GLOW_SKIP = new Set(['#FFFFFF', '#F5F7FA', '#000000', '#15181D', '#9CA3AF', '#CBD5E1']);
const GRADIENT_STRENGTH = 0.5;

type Gradient = readonly [string, string, ...string[]];

type TeamLogoProps = {
  variant?: 'default' | 'match';
  tla?: string | null;
  clubColors?: string | null;
  size?: number;
  shape?: 'circle' | 'rect';
  radius?: number;
  accentColor?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function TeamLogo({
  tla,
  clubColors,
  size = 40,
  shape = 'circle',
  radius,
  variant = 'default',
  accentColor,
  className,
  style,
}: TeamLogoProps) {
  const { colors } = useThemeTokens();
  const label = tla ?? '---';
  const teamColors = parseClubColors(clubColors);
  const glowColor = accentColor ?? pickGlowColor(teamColors, tla);

  if (variant === 'match') {
    return <MatchMark tla={label} size={size} glowColor={glowColor} className={className} style={style} />;
  }

  const fill = resolveFill(teamColors, tla, colors.surface);
  const isCircle = shape === 'circle';
  const borderRadius = radius ?? (isCircle ? size / 2 : size * 0.2);
  const borderWidth = Math.max(StyleSheet.hairlineWidth, size * 0.025);
  const fontSize = isCircle ? size * 0.5 : size * 0.9;

  return (
    <View
      className={className}
      accessibilityRole="image"
      accessibilityLabel={tla ?? undefined}
      style={[
        isCircle ? { width: size, height: size } : { minWidth: size * 1.6, height: size },
        {
          borderRadius,
          backgroundColor: setColorAlpha(colors.text, 0.28),
          padding: borderWidth,
        },
        style,
      ]}
    >
      <View style={[styles.fill, { borderRadius: Math.max(0, borderRadius - borderWidth), overflow: 'hidden' }]}>
        <LinearGradient
          colors={fill}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.4, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.initials,
            {
              color: colors.text,
              fontSize,
              lineHeight: fontSize * 1.35,
              letterSpacing: -fontSize * 0.1,
              paddingHorizontal: fontSize * 0.2,
              textShadowColor: setColorAlpha(colors.surface, 0.55),
              textShadowOffset: { width: 0, height: size * 0.025 },
              textShadowRadius: size * 0.05,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

function MatchMark({
  tla,
  size,
  glowColor,
  className,
  style,
}: {
  tla: string;
  size: number;
  glowColor: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const glowId = `teamGlow${useId().replace(/\W/g, '')}`;
  const glow = setColorAlpha(glowColor, 0.55);
  const lineHeight = Math.max(2, size * 0.014);

  return (
    <View className={className} style={[styles.matchBox, { width: size * 1.4, height: size * 0.9 }, style]}>
      <Svg preserveAspectRatio="none" style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} viewBox="0 0 100 100">
        <Defs>
          <SvgLinearGradient id={glowId} x1="0%" y1="50%" x2="100%" y2="70%">
            <Stop offset="0%" stopColor={glowColor} stopOpacity={0} />
            <Stop offset="20%" stopColor={glowColor} stopOpacity={0.4} />
            <Stop offset="80%" stopColor={glowColor} stopOpacity={0.4} />
            <Stop offset="100%" stopColor={glowColor} stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" rx="15" fill={`url(#${glowId})`} />
      </Svg>

      <Text
          allowFontScaling={false}
        numberOfLines={1}
        style={[
          styles.matchInitials,
          {
            fontSize: size * 0.8,
            letterSpacing: -size * 0.08,
            lineHeight: size,
            paddingHorizontal: size * 0.05,
            color: '#F1F5F9',
            transform: [{ skewX: '-10deg' }],
            textShadowColor: setColorAlpha(glowColor, 0.3),
            textShadowOffset: { width: 0, height: size * 0.015 },
            textShadowRadius: size * 0.11,
          },
        ]}
      >
        {tla}
      </Text>

      <View style={[styles.lightLineWrap, { width: size * 1.4, height: lineHeight, pointerEvents: 'none' }]}>
        <LinearGradient
          colors={[setColorAlpha(glowColor, 0), glow, '#FFFFFF', glow, setColorAlpha(glowColor, 0)]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.lightLine, { boxShadow: `0px 0px ${size * 0.1}px ${glowColor}` }]}
        />
      </View>
    </View>
  );
}

function parseClubColors(clubColors?: string | null): string[] {
  const hexes = (clubColors ?? '')
    .split('/')
    .map((part) => CLUB_COLOR_HEX[part.trim().toLowerCase()])
    .filter((hex): hex is string => Boolean(hex));

  return [...new Set(hexes)].slice(0, 3);
}

function pickGlowColor(teamColors: string[], seed?: string | null): string {
  const visible = teamColors.find((color) => !GLOW_SKIP.has(color.toUpperCase()));
  return visible ?? teamColors[0] ?? FALLBACK_PALETTE[hash(seed ?? '') % FALLBACK_PALETTE.length];
}

function resolveFill(parsed: string[], seed: string | null | undefined, surface: string): Gradient {
  const single = parsed[0] ?? FALLBACK_PALETTE[hash(seed ?? '') % FALLBACK_PALETTE.length];
  const [first, second, ...rest] = parsed.length > 1 ? parsed : [single, mix(single, '#000000', 0.7)];
  const soften = (color: string) => mix(color, surface, GRADIENT_STRENGTH);

  return [soften(first), soften(second), ...rest.map(soften)];
}

function mix(from: string, to: string, weight: number): string {
  const target = hexToRgb(to);

  return `#${hexToRgb(from)
    .map((channel, index) =>
      Math.round(channel * weight + target[index] * (1 - weight))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function hexToRgb(color: string): [number, number, number] {
  const match = color.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!match) return [0, 0, 0];

  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function hash(value: string): number {
  return [...value].reduce((result, char) => (result * 31 + char.charCodeAt(0)) % 100000, 0);
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: 'Oswald_700Bold',
    textAlign: 'center',
    transform: [{ skewX: '-10deg' }],
  },
  matchBox: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  matchInitials: {
    zIndex: 2,
    fontFamily: 'Oswald_700Bold',
    fontWeight: '700',
  },
  lightLineWrap: {
    position: 'absolute',
    bottom: '0%',
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightLine: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
});
