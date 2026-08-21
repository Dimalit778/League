import { useThemeTokens } from '@/hooks/useThemeTokens';
import { setColorAlpha } from '@/lib/color';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

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

/** Teams without clubColors get a stable color drawn from their initials. */
const FALLBACK_PALETTE = ['#2563EB', '#DC2626', '#16A34A', '#7E22CE', '#0EA5E9', '#F97316'];

/** How much of the club color survives the blend with the card surface. */
const GRADIENT_STRENGTH = 0.5;

type Gradient = readonly [string, string, ...string[]];

type TeamLogoProps = {
  tla?: string | null;
  clubColors?: string | null;
  name?: string | null;
  /** Height of the badge; the text scales off it. */
  size?: number;
  shape?: 'circle' | 'rect';
  /** Rect only: width relative to `size`. A wide TLA can stretch it further. */
  ratio?: number;
  /** Overrides the corner radius the shape picks by default. */
  radius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function TeamLogo({
  tla,
  clubColors,
  name,
  size = 40,
  shape = 'circle',
  ratio = 1.35,
  radius,
  className,
  style,
}: TeamLogoProps) {
  const { colors } = useThemeTokens();
  const initials = resolveInitials(tla, name);
  const fill = resolveFill(clubColors, initials, colors.surface);

  const isCircle = shape === 'circle';
  const borderRadius = radius ?? (isCircle ? size / 2 : size * 0.15);
  const borderWidth = Math.max(StyleSheet.hairlineWidth, size * 0.025);
  const innerRadius = Math.max(0, borderRadius - borderWidth);
  const fontSize = isCircle ? size * 0.5 : size * 0.9;
  return (
    <View
      className={className}
      accessibilityRole="image"
      accessibilityLabel={name ?? initials}
      style={[
        isCircle ? { width: size, height: size } : { minWidth: size * ratio, height: size },
        {
          borderRadius,
          backgroundColor: setColorAlpha(colors.text, 0.28),
          padding: borderWidth,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          isCircle ? null : { paddingHorizontal: size * 0.12 },
          { borderRadius: innerRadius, overflow: 'hidden' },
        ]}
      >
        <LinearGradient
          colors={fill}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.4, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text
          style={[
            styles.initials,
            {
              color: colors.text,
              fontSize,
              lineHeight: fontSize * 1.2,
              letterSpacing: -fontSize * 0.1,
              paddingRight: fontSize * 0.1,
              textShadowColor: setColorAlpha(colors.surface, 0.55),
              textShadowOffset: { width: 0, height: size * 0.025 },
              textShadowRadius: size * 0.05,
            },
          ]}
        >
          {initials}
        </Text>
      </View>
    </View>
  );
}

function resolveInitials(tla?: string | null, name?: string | null): string {
  if (tla?.trim()) return tla.trim().toUpperCase().slice(0, 3);

  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const source = words.length > 1 ? words.map((word) => word[0]).join('') : (words[0] ?? '?');

  return source.toUpperCase().slice(0, 3);
}

function parseClubColors(clubColors?: string | null): string[] {
  const hexes = (clubColors ?? '')
    .split('/')
    .map((part) => CLUB_COLOR_HEX[part.trim().toLowerCase()])
    .filter((hex): hex is string => Boolean(hex));

  return [...new Set(hexes)].slice(0, 3);
}

function resolveFill(clubColors: string | null | undefined, seed: string, surface: string): Gradient {
  const parsed = parseClubColors(clubColors);
  const single = parsed[0] ?? FALLBACK_PALETTE[hash(seed) % FALLBACK_PALETTE.length];
  // One color still needs a second stop, so it fades into a darker version of itself.
  const [first, second, ...rest] = parsed.length > 1 ? parsed : [single, mix(single, '#000000', 0.7)];
  const soften = (color: string) => mix(color, surface, GRADIENT_STRENGTH);

  return [soften(first), soften(second), ...rest.map(soften)];
}

function mix(from: string, to: string, weight: number): string {
  const target = hexToRgb(to);

  return `#${hexToRgb(from)
    .map((channel, index) =>
      Math.round(channel * weight + target[index] * (1 - weight)).toString(16).padStart(2, '0'),
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
    transform: [{ skewX: '-7deg' }],
  },
});
