import { useThemeTokens } from '@/hooks/useThemeTokens';
import { setColorAlpha } from '@/lib/color';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { type ImageSourcePropType, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CollapsibleHeaderProps = {
  children: ReactNode;

  variant?: 'collapsible' | 'fixed';

  expandedHeader?: ReactNode;
  collapsedHeader: ReactNode;
  /** Header chrome that remains fully visible throughout the collapse animation. */
  persistentHeader?: ReactNode;

  backgroundImage?: ImageSourcePropType;

  expandedHeight?: number;
  collapsedHeight?: number;

  overlap?: number;

  backgroundColor?: string;
  borderColor?: string;
  /** Scroll distance before the fixed header background starts appearing. */
  fixedBackgroundRevealStart?: number;
  /** Scroll distance used to reveal the header background in the `fixed` variant. */
  fixedBackgroundRevealDistance?: number;

  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
};

export const CollapsibleHeader = ({
  children,
  variant = 'collapsible',
  expandedHeader,
  collapsedHeader,
  persistentHeader,
  backgroundImage,

  expandedHeight = 210,
  collapsedHeight = 48,
  overlap = 0,

  backgroundColor,
  borderColor,
  fixedBackgroundRevealStart = 0,
  fixedBackgroundRevealDistance = 200,

  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}: CollapsibleHeaderProps) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeTokens();
  const scrollY = useSharedValue(0);

  const resolvedBackgroundColor = backgroundColor ?? colors.background;
  const resolvedBorderColor = borderColor ?? colors.border;
  const transparentBackground = setColorAlpha(resolvedBackgroundColor, 0);
  const collapseBackground = setColorAlpha(resolvedBackgroundColor, 0.94);
  const imageGradientColors = isDark
    ? (['rgba(4, 18, 35, 0.85)', 'rgba(4, 18, 35, 0.75)', 'rgba(4, 18, 35, 0.55)', resolvedBackgroundColor] as const)
    : ([
        'rgba(15, 23, 42, 0.62)',
        'rgba(15, 23, 42, 0.42)',
        'rgba(248, 249, 247, 0.3)',
        resolvedBackgroundColor,
      ] as const);

  const isFixed = variant === 'fixed';
  const collapseDistance = Math.max(1, expandedHeight - collapsedHeight);
  const backgroundRevealStart = Math.max(0, fixedBackgroundRevealStart);
  const backgroundRevealDistance = Math.max(1, fixedBackgroundRevealDistance);
  const backgroundRevealEnd = backgroundRevealStart + backgroundRevealDistance;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = Math.max(0, event.contentOffset.y);
    },
  });

  const headerBackgroundStyle = useAnimatedStyle(() => {
    if (isFixed) {
      return {
        height: backgroundImage ? expandedHeight + insets.top : collapsedHeight + insets.top,
        backgroundColor: 'transparent',
      };
    }

    const height = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [expandedHeight + insets.top, collapsedHeight + insets.top],
      Extrapolation.CLAMP,
    );

    const animatedBackgroundColor = interpolateColor(
      scrollY.value,
      [0, collapseDistance * 0.55, collapseDistance],
      [transparentBackground, collapseBackground, resolvedBackgroundColor],
    );

    return {
      height,
      backgroundColor: animatedBackgroundColor,
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [collapseDistance * 0.95, collapseDistance], [0, 1], Extrapolation.CLAMP),
    };
  });

  const fixedBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: isFixed
        ? interpolate(scrollY.value, [backgroundRevealStart, backgroundRevealEnd], [0, 1], Extrapolation.CLAMP)
        : 0,
    };
  });

  const backgroundImageStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, collapseDistance * 0.8], [1, 0], Extrapolation.CLAMP),

      transform: [
        {
          translateY: interpolate(scrollY.value, [0, collapseDistance], [0, -35], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollY.value, [0, collapseDistance], [1, 1.08], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const expandedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: isFixed
        ? 0
        : interpolate(scrollY.value, [collapseDistance * 0.1, collapseDistance * 0.3], [1, 0], Extrapolation.CLAMP),
    };
  });

  const collapsedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: isFixed
        ? 1
        : interpolate(scrollY.value, [collapseDistance * 0.4, collapseDistance * 0.45], [0, 1], Extrapolation.CLAMP),
    };
  });

  const contentTop = isFixed && !backgroundImage ? collapsedHeight : expandedHeight;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: resolvedBackgroundColor,
        },
      ]}
    >
      {/* Behind content — so overlap can sit on top of the image */}
      <Animated.View pointerEvents="none" style={[styles.headerBackground, headerBackgroundStyle]}>
        {backgroundImage ? (
          <Animated.View style={[StyleSheet.absoluteFill, backgroundImageStyle]}>
            <View style={StyleSheet.absoluteFill}>
              <Image source={backgroundImage} contentFit="cover" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={[...imageGradientColors]}
                locations={[0.1, 0.35, 0.75, 1]}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </Animated.View>
        ) : null}

        {!isFixed ? (
          <Animated.View style={[styles.border, borderStyle, { backgroundColor: resolvedBorderColor }]} />
        ) : null}
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        style={styles.scroll}
        contentContainerStyle={[
          {
            paddingTop: contentTop + insets.top - overlap,
            paddingBottom: insets.bottom + 110,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </Animated.ScrollView>

      {/* Same inset model for both — top:0 + paddingTop — so chrome lines up */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.toolbar,
          expandedContentStyle,
          {
            top: 0,
            height: expandedHeight + insets.top,
            paddingTop: insets.top,
          },
        ]}
      >
        {!isFixed ? expandedHeader : null}
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.toolbar,
          styles.collapsedToolbar,
          collapsedContentStyle,
          {
            top: 0,
            height: collapsedHeight + insets.top,
            paddingTop: insets.top,
            backgroundColor: isFixed ? undefined : resolvedBackgroundColor,
          },
        ]}
      >
        {isFixed ? (
          <>
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { backgroundColor: resolvedBackgroundColor }, fixedBackgroundStyle]}
            />
            <Animated.View
              pointerEvents="none"
              style={[styles.border, borderStyle, { backgroundColor: resolvedBorderColor }]}
            />
          </>
        ) : null}
        {collapsedHeader}
      </Animated.View>

      {persistentHeader ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.toolbar,
            styles.persistentToolbar,
            {
              top: 0,
              height: collapsedHeight + insets.top,
              paddingTop: insets.top,
            },
          ]}
        >
          {persistentHeader}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: 'hidden',
  },

  border: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
  },

  scroll: {
    zIndex: 1,
  },

  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  },

  collapsedToolbar: {
    zIndex: 101,
  },

  persistentToolbar: {
    zIndex: 102,
  },
});
