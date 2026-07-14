import { images } from '@/assets/images';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useMemo } from 'react';
import { ColorValue, View } from 'react-native';

const DARK_GRADIENT = ['#0B1B33', '#081325'] as const;
const DARK_OVERLAY = ['rgba(6,12,24,0.3)', 'rgba(6,12,24,0.55)', 'rgba(6,12,24,0.75)'] as const;
const LIGHT_OVERLAY = ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.55)'] as const;

export function HeaderSection({ children }: { children: ReactNode }) {
  const { theme, colors } = useThemeTokens();
  const isLight = theme === 'light';

  const gradientColors = useMemo<readonly [ColorValue, ColorValue, ...ColorValue[]]>(
    () => (isLight ? [colors.surfaceSecondary, colors.surface, colors.background] : DARK_GRADIENT),
    [colors.background, colors.surface, colors.surfaceSecondary, isLight],
  );

  const overlayColors = useMemo<readonly [ColorValue, ColorValue, ...ColorValue[]]>(
    () => (isLight ? [...LIGHT_OVERLAY, `${colors.surface}E8`] : DARK_OVERLAY),
    [colors.surface, isLight],
  );

  return (
    <View className="mx-3 mt-1 rounded-3xl border border-border overflow-hidden">
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: isLight ? 0.08 : 0.35,
          shadowRadius: isLight ? 8 : 14,
          shadowOffset: { width: 0, height: isLight ? 4 : 8 },
          elevation: isLight ? 3 : 8,
        }}
      >
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
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        {children}
      </LinearGradient>
    </View>
  );
}
