import { useThemeTokens } from '@/hooks/useThemeTokens';
import { setColorAlpha } from '@/lib/color';
import { cn } from '@/lib/nativewind/nativeWind';
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type BaseCardProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/* -------------------------------------------------------------------------- */
/*                              Flat Premium Card                             */
/* -------------------------------------------------------------------------- */

type FlatPremiumCardProps = BaseCardProps & {
  elevated?: boolean;
};

export function FlatPremiumCard({
  children,
  className,
  contentClassName,
  style,
  contentStyle,
  elevated = true,
}: FlatPremiumCardProps) {
  const { colors, isDark } = useThemeTokens();

  return (
    <View
      className={cn('w-full overflow-hidden rounded-3xl border border-border bg-surface', className)}
      style={[
        elevated &&
          Platform.select({
            ios: {
              shadowColor: colors.text,
              shadowOpacity: isDark ? 0.28 : 0.1,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
            },
            android: { elevation: 8 },
          }),
        style,
      ]}
    >
      <View className={cn('p-5', contentClassName)} style={contentStyle}>
        {children}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Frosted Glass Card                            */
/* -------------------------------------------------------------------------- */

type FrostedGlassCardProps = BaseCardProps & {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
};

export function FrostedGlassCard({
  children,
  className,
  contentClassName,
  style,
  contentStyle,
  intensity = 40,
  tint = 'default',
}: FrostedGlassCardProps) {
  const { colors, isDark } = useThemeTokens();
  const blurTint = tint === 'default' ? (isDark ? 'dark' : 'light') : tint;
  const overlayAlpha = Platform.OS === 'android' ? 0.82 : isDark ? 0.44 : 0.55;

  return (
    <View
      className={cn('w-full overflow-hidden rounded-3xl border border-border', className)}
      style={[
        Platform.select({
          ios: {
            shadowColor: colors.text,
            shadowOpacity: isDark ? 0.24 : 0.08,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
          },
          android: { elevation: 8 },
        }),
        style,
      ]}
    >
      <BlurView intensity={intensity} tint={blurTint} style={styles.glassBlur}>
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: setColorAlpha(colors.surface, overlayAlpha) }]}
        />
        <View
          pointerEvents="none"
          style={[styles.glassTopHighlight, { backgroundColor: setColorAlpha(colors.text, isDark ? 0.18 : 0.08) }]}
        />
        <View className={cn('p-5', contentClassName)} style={contentStyle}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Layered Card                                */
/* -------------------------------------------------------------------------- */

type LayeredCardProps = BaseCardProps & {
  innerClassName?: string;
  innerStyle?: StyleProp<ViewStyle>;
};

export function LayeredCard({
  children,
  className,
  contentClassName,
  innerClassName,
  style,
  contentStyle,
  innerStyle,
}: LayeredCardProps) {
  const { colors, isDark } = useThemeTokens();

  return (
    <View
      className={cn('w-full rounded-[28px] border border-border bg-surface p-2', className)}
      style={[
        Platform.select({
          ios: {
            shadowColor: colors.text,
            shadowOpacity: isDark ? 0.28 : 0.1,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 12 },
          },
          android: { elevation: 9 },
        }),
        style,
      ]}
    >
      <View
        className={cn('rounded-[21px] border border-border bg-subtle p-5', contentClassName, innerClassName)}
        style={[
          Platform.select({
            ios: {
              shadowColor: colors.text,
              shadowOpacity: isDark ? 0.22 : 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
            },
            android: { elevation: 5 },
          }),
          innerStyle,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glassBlur: {
    overflow: 'hidden',
  },
  glassTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
  },
});
