import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeTokens } from '@/hooks/useThemeTokens';

export function BottomTabsBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useThemeTokens();

  return (
    <View className="bg-background">
      <LinearGradient
        colors={[colors.background, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.tabBar,
          styles.tabBarShadow,
          {
            borderTopColor: colors.border,
          },
        ]}
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
            color: isFocused ? colors.background : colors.muted,
            size: isFocused ? 26 : 22,
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
                  isFocused ? styles.iconWrapperActive : styles.iconWrapperInactive,
                  {
                    backgroundColor: isFocused ? colors.primary : colors.surface,
                    borderWidth: isFocused ? 0 : 0.5,
                    borderColor: isFocused ? 'transparent' : colors.border,
                  },
                  isFocused ? styles.iconWrapperShadow : {},
                ]}
              >
                {icon}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.text : colors.muted,
                    fontWeight: isFocused ? '600' : '500',
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
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
  },
  tabBarShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconWrapperInactive: {
    transform: [{ translateY: 4 }],
  },
  iconWrapperActive: {
    transform: [{ translateY: 0 }],
  },
  label: {
    marginTop: 10,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});

export default BottomTabsBar;
