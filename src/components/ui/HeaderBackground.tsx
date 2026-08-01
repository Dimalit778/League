import { images } from '@/assets/images';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { radius } from '@/lib/nativewind/radius';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useMemo } from 'react';
import { ColorValue, View } from 'react-native';

const DARK_OVERLAY = ['rgba(7,21,37,0.78)', 'rgba(7,21,37,0.62)', 'rgba(7,21,37,0.84)'] as const;
const LIGHT_OVERLAY = ['rgba(248,249,247,0.72)', 'rgba(248,249,247,0.52)', 'rgba(248,249,247,0.82)'] as const;
const OVERLAY_LOCATIONS = [0, 0.5, 1] as const;

type HeaderBackgroundProps = {
  children: ReactNode;
};

export function HeaderBackground({ children }: HeaderBackgroundProps) {
  const { theme, colors } = useThemeTokens();
  const isLight = theme === 'light';

  const overlayColors = useMemo<readonly [ColorValue, ColorValue, ...ColorValue[]]>(
    () => (isLight ? LIGHT_OVERLAY : DARK_OVERLAY),
    [isLight],
  );
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
        <View style={{ backgroundColor: colors.surface }}>
          <ExpoImage
            source={images.pitchGrass}
            contentFit="cover"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              opacity: isLight ? 0.82 : 0.68,
            }}
          />

          <LinearGradient
            colors={overlayColors}
            locations={[...OVERLAY_LOCATIONS]}
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
        </View>
      </View>
    </View>
  );
}
