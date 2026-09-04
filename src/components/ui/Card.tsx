import { useThemeTokens } from '@/hooks/useThemeTokens';
import { setColorAlpha } from '@/lib/color';
import { cn } from '@/lib/nativewind/nativeWind';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

export type CardVariant = 'surface' | 'soft' | 'flat' | 'outline';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

type BaseCardProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: StyleProp<ViewStyle>;
};

type StaticCardProps = BaseCardProps &
  Omit<ViewProps, 'children' | 'className' | 'style'> & {
    onPress?: never;
  };

type PressableCardProps = BaseCardProps &
  Omit<PressableProps, 'children' | 'className' | 'style' | 'onPress'> & {
    onPress: NonNullable<PressableProps['onPress']>;
  };

export type CardProps = StaticCardProps | PressableCardProps;

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<View, CardProps>(function Card(
  { children, className, contentClassName, variant = 'soft', padding = 'md', style, onPress, ...props },
  ref,
) {
  const { isDark, colors, gradients, effects, radius } = useThemeTokens();
  const borderRadius = radius.lg;
  const isOutline = variant === 'outline';
  const isSoft = variant === 'soft';
  const isSurface = variant === 'surface';
  // `flat` is a filled card with a clean border and no shadow — for dense lists
  // (match rows, etc.) where a drop shadow reads muddy.
  const isFlat = variant === 'flat';
  const noShadow = isOutline || isFlat;

  // filled cards (soft/flat) go white in light, one step lighter than ground (subtle) in dark.
  const fillColor = isOutline ? 'transparent' : (isSoft || isFlat) && isDark ? colors.subtle : colors.surface;
  const shadowAlpha = isSurface ? (isDark ? 0.5 : 0.12) : isSoft ? (isDark ? 0.28 : 0.06) : 0;
  const shadowRadius = isSurface ? 18 : isSoft ? 6 : 10;
  const shadowOffset = isSurface ? 6 : 3;
  const boxShadow = noShadow
    ? undefined
    : `0 ${shadowOffset}px ${shadowRadius}px ${setColorAlpha(effects.cardShadow, shadowAlpha)}`;

  const shadowStyle: ViewStyle = noShadow
    ? {}
    : {
        boxShadow,
        shadowColor: effects.cardShadow,
        shadowOpacity: shadowAlpha,
        shadowRadius,
        shadowOffset: { width: 0, height: shadowOffset },
        ...(Platform.OS === 'android' ? { elevation: isSurface ? 5 : 2 } : null),
      };

  const content = <View className={cn(paddingClasses[padding], contentClassName)}>{children}</View>;

  const inner = (
    <View
      style={[
        styles.shell,
        {
          borderRadius,
          borderWidth: 1,
          borderColor: isSurface
            ? setColorAlpha(colors.primary, isDark ? 0.32 : 0.16)
            : isOutline || isFlat
              ? colors.border
              : effects.cardBorder,
          backgroundColor: fillColor,
        },
      ]}
    >
      {isSurface ? (
        <LinearGradient
          colors={[...gradients.card]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.gradient, { borderRadius }]}
        >
          <LinearGradient
            colors={[effects.cardHighlight, setColorAlpha(effects.cardHighlight, 0)]}
            locations={[0, 1]}
            style={[styles.highlight, { pointerEvents: 'none' }]}
          />
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </View>
  );

  const cardStyle = [styles.wrapper, { borderRadius }, shadowStyle, style];

  if (onPress) {
    const pressableProps = props as PressableProps;

    return (
      <Pressable
        ref={ref}
        {...pressableProps}
        onPress={onPress}
        accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <View className={cn('w-full', className)} style={cardStyle}>
          {inner}
        </View>
      </Pressable>
    );
  }

  return (
    <View ref={ref} {...(props as ViewProps)} className={cn(className)} style={cardStyle}>
      {inner}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  shell: {
    overflow: 'hidden',
    flex: 1,
  },
  gradient: {
    overflow: 'hidden',
    flex: 1,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
});
