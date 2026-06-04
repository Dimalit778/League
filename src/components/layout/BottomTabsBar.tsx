import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeTokens } from '@/hooks/useThemeTokens';

const isIOS = Platform.OS === 'ios';

export const BottomTabsBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors, theme } = useThemeTokens();
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

    const onPress = () => {
      if (isIOS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      color: isFocused ? colors.primary : colors.muted,
      size: 24,
    });

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
        {!isIOS && isFocused ? (
          <View style={[styles.androidPill, { backgroundColor: colors.primary + '30' }]}>
            {icon}
          </View>
        ) : (
          <View style={styles.iconPlain}>{icon}</View>
        )}
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

  const inner = (
    <View style={[styles.inner, { paddingBottom: Math.max(insets.bottom, 8) }]}>{tabs}</View>
  );

  if (isIOS) {
    return (
      <BlurView
        intensity={80}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={[styles.iosShadow, { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}
      >
        {inner}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.androidContainer,
        { backgroundColor: colors.surface, borderTopColor: colors.border },
      ]}
    >
      {inner}
    </View>
  );
};

const styles = StyleSheet.create({
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  androidContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 3,
  },
  inner: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  iconPlain: {
    height: 32,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidPill: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
