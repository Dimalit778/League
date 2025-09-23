import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
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
  wrapperShadow: {
    shadowColor: string;
    shadowOpacity: number;
  };
};

export function BottomTabsBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { theme, colors } = useThemeTokens();

  const palette: Palette = useMemo(() => {
    if (theme === 'dark') {
      return {
        gradient: ['#050B1C', '#0B1C3F'],
        iconInactiveBg: 'rgba(148, 163, 184, 0.12)',
        iconInactiveBorder: 'rgba(148, 163, 184, 0.24)',
        iconActiveBg: 'rgba(96, 165, 250, 0.35)',
        iconActiveBorder: 'rgba(96, 165, 250, 0.85)',
        iconInactiveColor: 'rgba(226, 232, 240, 0.7)',
        iconActiveColor: '#FFFFFF',
        labelInactive: 'rgba(226, 232, 240, 0.7)',
        labelActive: '#FFFFFF',
        indicator: colors.secondary,
        wrapperShadow: {
          shadowColor: '#010511',
          shadowOpacity: 0.45,
        },
      };
    }

    return {
      gradient: ['#E0E7FF', '#E2E8F0'],
      iconInactiveBg: 'rgba(100, 116, 139, 0.12)',
      iconInactiveBorder: 'rgba(100, 116, 139, 0.28)',
      iconActiveBg: 'rgba(59, 130, 246, 0.25)',
      iconActiveBorder: 'rgba(59, 130, 246, 0.55)',
      iconInactiveColor: 'rgba(30, 41, 59, 0.55)',
      iconActiveColor: colors.surface,
      labelInactive: 'rgba(30, 41, 59, 0.6)',
      labelActive: colors.text,
      indicator: colors.primary,
      wrapperShadow: {
        shadowColor: 'rgba(15, 23, 42, 0.4)',
        shadowOpacity: 0.25,
      },
    } as const;
  }, [colors.primary, colors.secondary, colors.surface, colors.text, theme]);

  return (
    <View className="bg-background">
      <LinearGradient
        colors={palette.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
            color: isFocused
              ? palette.iconActiveColor
              : palette.iconInactiveColor,
            size: isFocused ? 34 : 24,
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
                      ? palette.iconActiveBg
                      : palette.iconInactiveBg,
                    borderColor: isFocused
                      ? palette.iconActiveBorder
                      : palette.iconInactiveBorder,
                  },
                ]}
              >
                {icon}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused
                      ? palette.labelActive
                      : palette.labelInactive,
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
    borderWidth: 1.5,
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
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

export default BottomTabsBar;
