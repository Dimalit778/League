import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

const teamShirt = require('@assets/left-jersey.png');

type JerseyProps = {
  teamName?: string;
  clubColors?: string | null;
  size?: number;
};

type JerseyConfig = {
  mode: 'solid' | 'gradient';
  bodyColor: string;
  textColor: string;
  gradientColors?: [string, string, ...string[]];
};

export default function Jersey({ teamName, clubColors, size = 52 }: JerseyProps) {
  const height = size + 12;
  const config = getJerseyConfig(clubColors);
  const label = teamName;

  return (
    <View style={[styles.wrapper, { width: size, height }]}>
      <MaskedView
        style={{ width: size, height }}
        maskElement={<Image source={teamShirt} style={{ width: size, height }} resizeMode="contain" />}
      >
        <JerseyDesignLayer config={config} size={size} height={height} />
      </MaskedView>

      <View style={styles.textLayer} pointerEvents="none">
        {label ? (
          <Text
            style={[
              styles.teamText,
              {
                color: config.textColor,
                fontSize: size * 0.15,
                maxWidth: size * 0.78,
                textShadowColor: getTextShadowColor(config.textColor),
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
          >
            {label}
          </Text>
        ) : null}
      </View>

      <Image
        source={teamShirt}
        style={[
          styles.absolute,
          styles.shadowLayer,
          {
            width: size,
            height,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

type JerseyDesignLayerProps = {
  config: JerseyConfig;
  size: number;
  height: number;
};

function JerseyDesignLayer({ config, size, height }: JerseyDesignLayerProps) {
  return (
    <View
      style={[
        styles.designBase,
        {
          width: size,
          height,
          backgroundColor: config.bodyColor,
        },
      ]}
    >
      {config.mode === 'gradient' && config.gradientColors ? (
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View
        style={[
          styles.innerShadeRight,
          {
            width: size * 0.22,
          },
        ]}
      />

      <View
        style={[
          styles.innerShadeLeft,
          {
            width: size * 0.14,
          },
        ]}
      />

      <View style={styles.lightOverlay} />
    </View>
  );
}

function getJerseyConfig(clubColors?: string | null): JerseyConfig {
  const fallback: JerseyConfig = {
    mode: 'solid',
    bodyColor: '#CCCCCC',
    textColor: '#000000',
  };

  if (!clubColors) {
    return fallback;
  }

  const colors = clubColors
    .split('/')
    .map((color) => color.trim())
    .filter(Boolean)
    .map(colorNameToHex);

  if (colors.length === 0) {
    return fallback;
  }

  if (colors.length === 1) {
    return {
      mode: 'solid',
      bodyColor: colors[0],
      textColor: '#000000',
    };
  }

  if (colors.length === 2) {
    return {
      mode: 'solid',
      bodyColor: colors[0],
      textColor: '#000000',
    };
  }

  return {
    mode: 'gradient',
    bodyColor: colors[0],
    gradientColors: [shadeColor(colors[0], 8), colors[0], colors[1], shadeColor(colors[1], -6)],
    textColor: '#000000',
  };
}

function colorNameToHex(color: string): string {
  const normalized = color.toLowerCase();

  const colorMap: Record<string, string> = {
    black: '#111111',
    white: '#FFFFFF',

    blue: '#005BBB',
    red: '#D71920',
    green: '#168A45',
    yellow: '#F5D000',
    gold: '#D4AF37',
    orange: '#F28C28',
    purple: '#6A1B9A',
    pink: '#E91E63',
    brown: '#795548',

    grey: '#808080',
    gray: '#808080',

    navy: '#0B1F3A',
    maroon: '#8B1E3F',
    claret: '#8B1E3F',

    sky: '#8ED6F8',
    'sky blue': '#8ED6F8',
    lightblue: '#8ED6F8',
    'light blue': '#8ED6F8',

    darkblue: '#003F8F',
    'dark blue': '#003F8F',
  };

  return colorMap[normalized] ?? '#999999';
}

function shadeColor(hex: string, percent: number) {
  if (!hex.startsWith('#')) {
    return hex;
  }

  const cleanHex = hex.replace('#', '');

  if (cleanHex.length !== 6) {
    return hex;
  }

  const num = parseInt(cleanHex, 16);

  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const adjust = (channel: number) => {
    return Math.max(0, Math.min(255, channel + (255 * percent) / 100));
  };

  const newR = Math.round(adjust(r));
  const newG = Math.round(adjust(g));
  const newB = Math.round(adjust(b));

  return `rgb(${newR}, ${newG}, ${newB})`;
}

function getTextShadowColor(textColor: string) {
  const normalized = textColor.toLowerCase();

  if (
    normalized === '#ffffff' ||
    normalized === 'white' ||
    normalized === '#f5d000' ||
    normalized === 'yellow' ||
    normalized === '#d4af37' ||
    normalized === 'gold'
  ) {
    return 'rgba(0,0,0,0.9)';
  }

  return 'rgba(255,255,255,0.9)';
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },

  absolute: {
    position: 'absolute',
  },

  designBase: {
    position: 'relative',
    overflow: 'hidden',
  },

  innerShadeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 4,
  },

  innerShadeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    zIndex: 4,
  },

  lightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
    zIndex: 5,
  },

  shadowLayer: {
    opacity: 0.2,
    zIndex: 30,
    elevation: 30,
  },

  textLayer: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  teamText: {
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',

    opacity: 0.7,

    transform: [{ scaleY: 0.92 }],

    textShadowOffset: { width: 0, height: 0.2 },
    textShadowRadius: 1,
  },
});
