import { images } from '@/assets/images';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useMemo } from 'react';
import { ColorValue, View } from 'react-native';

const DARK_GRADIENT = ['#0B1B33', '#081325'] as const;

const DARK_OVERLAY = ['rgba(6,12,24,0.3)', 'rgba(6,12,24,0.55)', 'rgba(6,12,24,0.75)'] as const;

const LIGHT_OVERLAY = ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.55)'] as const;

type HeaderSectionProps = {
  children: ReactNode;
  fullBleed?: boolean;
};

export function HeaderSection({ children, fullBleed = false }: HeaderSectionProps) {
  const { theme, colors } = useThemeTokens();
  const isLight = theme === 'light';

  const gradientColors = useMemo<readonly [ColorValue, ColorValue, ...ColorValue[]]>(
    () => (isLight ? [colors.surfaceSoft, colors.surface, colors.background] : DARK_GRADIENT),
    [colors.background, colors.surface, colors.surfaceSoft, isLight],
  );

  const overlayColors = useMemo<readonly [ColorValue, ColorValue, ...ColorValue[]]>(
    () => (isLight ? [...LIGHT_OVERLAY, `${colors.surface}E8`] : DARK_OVERLAY),
    [colors.surface, isLight],
  );

  return (
    <View
      style={{
        shadowColor: '#000',
        shadowOpacity: isLight ? 0.1 : 0.35,
        shadowRadius: isLight ? 10 : 16,
        shadowOffset: {
          width: 0,
          height: isLight ? 5 : 9,
        },
        elevation: isLight ? 4 : 9,
      }}
    >
      {/* השכבה הרחבה יוצרת את צורת חצי האליפסה */}
      <View
        style={{
          width: '116%',
          marginLeft: '-8%',
          overflow: 'hidden',

          borderBottomLeftRadius: 100,
          borderBottomRightRadius: 100,

          paddingHorizontal: '8%',
          paddingBottom: 8,

          borderBottomWidth: 1,

          borderBottomColor: colors.border,
        }}
      >
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <ExpoImage
            source={images.pitchGrass}
            contentFit="cover"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              opacity: isLight ? 0.3 : 0.22,
            }}
          />

          <LinearGradient
            colors={overlayColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />

          {children}
        </LinearGradient>
      </View>
    </View>
  );
}
