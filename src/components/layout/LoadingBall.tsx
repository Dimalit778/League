import { useLayoutEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const ballImage = require('@assets/ball.png');
const BALL_SIZE = 120;
/** Vertical travel (px); ball moves from `-BOUNCE_UP` (apex) to `0` (rest). */
const BOUNCE_UP = 130;
const FALL_MS = 400;
const RISE_MS = 560;

const SHADOW_WIDTH = Math.round(BALL_SIZE * 0.78);
const SHADOW_HEIGHT = 12;
/** Negative margin pulls the ellipse up so it sits under the ball like a contact patch. */
const SHADOW_OVERLAP = Math.round(SHADOW_HEIGHT * 1.2);

declare const __DEV__: boolean;

function splashAnimRevision(): number {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return 0;
  const g = globalThis as { __splashAnimRevision?: number };
  g.__splashAnimRevision = (g.__splashAnimRevision ?? 0) + 1;
  return g.__splashAnimRevision;
}

const SPLASH_ANIM_REVISION = splashAnimRevision();

export const LoadingBall = () => {
  const translateY = useSharedValue(-BOUNCE_UP);

  useLayoutEffect(() => {
    cancelAnimation(translateY);
    translateY.value = -BOUNCE_UP;

    const raf = requestAnimationFrame(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(0, {
            duration: FALL_MS,
            easing: Easing.in(Easing.cubic),
          }),
          withTiming(-BOUNCE_UP, {
            duration: RISE_MS,
            easing: Easing.out(Easing.cubic),
          }),
        ),
        -1,
        false,
      );
    });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimation(translateY);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SPLASH_ANIM_REVISION]);

  const ballStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => {
    const grounded = Math.min(1, Math.max(0, (translateY.value + BOUNCE_UP) / BOUNCE_UP));
    return {
      opacity: 0.12 + 0.42 * grounded,
      transform: [{ scaleX: 0.48 + 0.52 * grounded }],
    };
  });

  return (
    <View className="flex-1 bg-background">
      <View style={styles.stage} pointerEvents="box-none">
        <View style={styles.ballColumn}>
          <Animated.View style={[styles.ball, ballStyle]}>
            <Image source={ballImage} style={styles.ballImage} resizeMode="contain" />
          </Animated.View>
          <Animated.View style={[styles.ballShadow, shadowStyle]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ballColumn: {
    alignItems: 'center',
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    overflow: 'hidden',
    borderRadius: BALL_SIZE / 2,
  },
  ballImage: {
    width: '100%',
    height: '100%',
  },
  ballShadow: {
    marginTop: -SHADOW_OVERLAP,
    width: SHADOW_WIDTH,
    height: SHADOW_HEIGHT / 2,
    borderRadius: SHADOW_HEIGHT / 2,
    backgroundColor: '#fff',
  },
});
