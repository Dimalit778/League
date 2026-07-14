import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeTokens } from '@/hooks/useThemeTokens';

const isIOS = Platform.OS === 'ios';
const FLOATING_TAB = 'Matches';

const EXTERNAL_TABS: Record<string, string> = {
  Leagues: '/(app)/(user)/leagues',
};

const FLOAT_SIZE = 60;
const FLOAT_OFFSET = 28;
const FLOAT_RADIUS = 18;

export function BottomTabsBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useThemeTokens();
  const insets = useSafeAreaInsets();

  const tabs = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
          ? options.title
          : route.name;

    const isFocused = state.index === index;
    const isFloating = route.name === FLOATING_TAB;

    const onPress = () => {
      if (isIOS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const externalHref = EXTERNAL_TABS[route.name];
      if (externalHref) {
        router.navigate(externalHref as any);
        return;
      }

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

    const icon = options.tabBarIcon?.({
      focused: isFocused,
      color: isFloating ? '#fff' : isFocused ? colors.primary : colors.muted,
      size: isFloating ? 28 : 24,
    });

    if (isFloating) {
      return (
        <Pressable
          key={route.key}
          accessibilityRole="button"
          accessibilityState={isFocused ? { selected: true } : {}}
          accessibilityLabel={options.tabBarAccessibilityLabel}
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.floatingWrapper}
        >
          {/* glow layer */}
          <View
            style={[styles.floatingGlow, { backgroundColor: colors.primary + '40', shadowColor: colors.primary }]}
          />
          {/* button */}
          <View style={[styles.floatingButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            {icon}
          </View>
          <Text
            style={[
              styles.label,
              { color: isFocused ? colors.primary : colors.muted, fontWeight: isFocused ? '600' : '400', marginTop: 4 },
            ]}
          >
            {label as string}
          </Text>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        android_ripple={!isIOS ? { color: colors.primary + '20', borderless: true } : undefined}
        style={styles.item}
      >
        <View style={styles.iconPlain}>{icon}</View>
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? colors.primary : colors.muted,
              fontWeight: isFocused ? '600' : '400',
            },
          ]}
        >
          {label as string}
        </Text>
      </Pressable>
    );
  });

  return (
    <View style={[styles.outerWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.pill, { backgroundColor: colors.surface }]}>
        <View style={styles.inner}>{tabs}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  pill: {
    borderRadius: 36,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  inner: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 4,
    overflow: 'visible',
    alignItems: 'flex-end',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingBottom: 2,
  },
  iconPlain: {
    height: 32,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingWrapper: {
    flex: 1,
    alignItems: 'center',
    marginBottom: -10,
    marginTop: -FLOAT_OFFSET,
  },
  floatingGlow: {
    position: 'absolute',
    top: -6,
    width: FLOAT_SIZE + 16,
    height: FLOAT_SIZE + 16,
    borderRadius: FLOAT_RADIUS + 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 0,
  },
  floatingButton: {
    width: FLOAT_SIZE,
    height: FLOAT_SIZE,
    borderRadius: FLOAT_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
