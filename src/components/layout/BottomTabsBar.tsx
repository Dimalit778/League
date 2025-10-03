import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeTokens } from '@/hooks/useThemeTokens';

type Palette = {
  gradient: [string, string];
  iconInactiveBg: string;
  iconInactiveBorder: string;
  iconActiveBg: string;
  iconActiveBorder: string;
  iconInactiveColor: string;
  iconActiveColor: string;
  labelInactive: string;
  labelActive: string;
  indicator: string;
};

export function BottomTabsBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { theme, colors } = useThemeTokens();

  return (
    <View className="bg-background">
      <LinearGradient
        colors={[colors.background, colors.surface, colors.border]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.tabBar]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? colors.primary : colors.muted,
            size: isFocused ? 32 : 24,
          });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.item}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isFocused
                    ? styles.iconWrapperActive
                    : styles.iconWrapperInactive,
                  {
                    backgroundColor: isFocused
                      ? colors.background
                      : colors.border,
                    borderColor: isFocused ? colors.primary : colors.border,
                  },
                ]}
              >
                {icon}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.text : colors.muted,
                    fontWeight: isFocused ? 'bold' : 'normal',
                  },
                ]}
              >
                {label as string}
              </Text>
            </Pressable>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingBottom: 25,
    paddingHorizontal: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },

  iconWrapper: {
    width: 55,
    height: 55,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperInactive: {
    transform: [{ translateY: 6 }],
  },
  iconWrapperActive: {
    transform: [{ translateY: 0 }],
  },
  label: {
    marginTop: 12,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});

export default BottomTabsBar;
