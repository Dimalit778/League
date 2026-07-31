import { images } from '@/assets/images';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { radius } from '@/lib/nativewind/radius';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useMemo } from 'react';
import { ColorValue, View } from 'react-native';

const DARK_GRADIENT = ['#0B1B33', '#081325'] as const;

/** Vignette: darker at edges, grass clear in the middle. */
const DARK_OVERLAY = [
  'rgba(6,12,24,0.9)',
  'rgba(6,12,24,0.9)',
  'rgba(6,12,24,0.1)',
  'rgba(6,12,24,0.45)',
  'rgba(6,12,24,0.92)',
] as const;
const DARK_OVERLAY_LOCATIONS = [0, 0.2, 0.5, 0.8, 1] as const;

const LIGHT_OVERLAY = [
  'rgba(255,255,255,0.9)',
  'rgba(255,255,255,0.1)',
  'rgba(255,255,255,0.15)',
  'rgba(255,255,255,0.2)',
  'rgba(255,255,255,0.92)',
] as const;
const LIGHT_OVERLAY_LOCATIONS = [0, 0.2, 0.5, 0.8, 1] as const;

type HeaderBackgroundProps = {
  children: ReactNode;
};

export function HeaderBackground({ children }: HeaderBackgroundProps) {
  const { theme, colors } = useThemeTokens();
  const isLight = theme === 'light';

  const gradientColors = useMemo<readonly [ColorValue, ColorValue, ...ColorValue[]]>(
    () => (isLight ? [colors.surfaceSoft, colors.surface, colors.background] : DARK_GRADIENT),
    [colors.background, colors.surface, colors.surfaceSoft, isLight],
  );

  const overlayColors = useMemo<readonly [ColorValue, ColorValue, ...ColorValue[]]>(
    () => (isLight ? LIGHT_OVERLAY : DARK_OVERLAY),
    [isLight],
  );
  const overlayLocations = isLight ? LIGHT_OVERLAY_LOCATIONS : DARK_OVERLAY_LOCATIONS;

  return (
    <View
      className={radius.xl}
      style={{
        shadowColor: '#000',
        shadowOpacity: isLight ? 0.1 : 0.25,
        shadowRadius: isLight ? 10 : 12,
        shadowOffset: {
          width: 0,
          height: isLight ? 5 : 9,
        },
        elevation: isLight ? 4 : 9,
      }}
    >
      <View className={`${radius.xl} overflow-hidden`}>
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
              opacity: 0.4,
            }}
          />

          <LinearGradient
            colors={overlayColors}
            locations={[...overlayLocations]}
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
