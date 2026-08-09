import { useThemeTokens } from '@/hooks/useThemeTokens';
import { setColorAlpha } from '@/lib/color';
import { cn } from '@/lib/nativewind/nativeWind';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export type GlassCardPadding = 'none' | 'sm' | 'md' | 'lg';
export type GlassCardVariant = 'default' | 'primary';
const lightTokens = {
  gradients: {
    card: ['#F8FAFC', '#F1F5F9', '#E8EEF4'],
    primaryCard: ['#FFFCF5', '#FFF8E8', '#FFFFFF'],
  },

  effects: {
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    cardHighlight: 'rgba(255, 255, 255, 0.8)',

    cardActiveGlow: 'rgba(122, 88, 0, 0.1)',
    cardShadow: '#475569',
    primaryCardBorder: 'rgba(122, 88, 0, 0.16)',
    primaryCardHighlight: 'rgba(255, 248, 230, 0.9)',
  },
} as const;

const darkTokens = {
  gradients: {
    card: ['#10283C', '#0C2032', '#091A2A'],

    // Gold wash → navy background
    primaryCard: ['#0C2032', '#0D2033', '#071525'],
  },

  effects: {
    cardBorder: 'rgba(120, 155, 185, 0.18)',
    cardHighlight: 'rgba(255, 255, 255, 0.06)',

    cardActiveGlow: 'rgba(214, 162, 30, 0.22)',
    cardShadow: '#000000',
    primaryCardBorder: 'rgba(214, 162, 30, 0.45)',
    primaryCardHighlight: 'rgba(214, 162, 30, 0.16)',
  },
} as const;

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  contentClassName?: string;
  padding?: GlassCardPadding;
  variant?: GlassCardVariant;
  className?: string;
  onPress?: () => void;
};

export function GlassCard({
  children,
  style,
  contentStyle,
  contentClassName,
  className,
  padding = 'sm',
  variant = 'default',
  onPress,
}: GlassCardProps) {
  const { theme, colors, radius, spacing } = useThemeTokens();
  const tokens = theme === 'light' ? lightTokens : darkTokens;

  const borderRadius = radius.lg;
  const isPrimary = variant === 'primary';
  const isLight = theme === 'light';
  const gradient = isPrimary ? tokens.gradients.primaryCard : tokens.gradients.card;
  const borderColor = isPrimary ? tokens.effects.primaryCardBorder : tokens.effects.cardBorder;
  const highlight = isPrimary ? tokens.effects.primaryCardHighlight : tokens.effects.cardHighlight;
  const contentPadding =
    padding === 'none' ? 0 : padding === 'sm' ? spacing[3] : padding === 'lg' ? spacing[6] : spacing[4];

  const CardInner = (
    <View
      className={className}
      style={[
        styles.wrapper,
        {
          borderRadius,
          shadowColor: isLight ? tokens.effects.cardShadow : isPrimary ? colors.primary : tokens.effects.cardShadow,
        },
        isLight ? styles.elevationLight : styles.elevation,
        style,
      ]}
    >
      <View
        style={[
          styles.cardShell,
          {
            borderRadius,
            borderColor,
            // Surface lifts the card off the page background in light mode
            backgroundColor: colors.surface,
          },
        ]}
      >
        <LinearGradient
          colors={[...gradient]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.gradient, { borderRadius }]}
        >
          {!isLight && (
            <LinearGradient
              pointerEvents="none"
              colors={[
                isLight ? tokens.effects.cardHighlight : tokens.effects.cardHighlight,
                setColorAlpha(isLight ? tokens.effects.cardHighlight : tokens.effects.cardHighlight, 0),
              ]}
              locations={[0, 1]}
              style={styles.highlightTop}
            />
          )}

          <View className={cn('flex-1', contentClassName)} style={[{ padding: contentPadding }, contentStyle]}>
            {children}
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.fill, pressed && { opacity: 0.94, transform: [{ scale: 0.985 }] }]}
      >
        {CardInner}
      </Pressable>
    );
  }

  return CardInner;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
  wrapper: {
    position: 'relative',
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
  cardShell: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 1.5,
  },
  elevation: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  elevationLight: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.07,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 5 },
      },
      android: {
        elevation: 1,
      },
    }),
  },
  gradient: {
    flex: 1,
    overflow: 'hidden',
  },
  highlightTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
});
