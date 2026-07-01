import { FieldIcon, MatchesIcon, ProfileIcon, RankIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isIOS = Platform.OS === 'ios';
const PILL_HEIGHT = 64;

export const getFloatBottomTabsInset = (safeAreaBottom: number) => PILL_HEIGHT + Math.max(safeAreaBottom);

export const useFloatBottomTabsInset = () => {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'web' ? 0 : getFloatBottomTabsInset(insets.bottom);
};

type TabConfig = {
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  isCenter?: boolean;
};

const tabsConfig: Record<string, TabConfig> = {
  index: { label: 'Home', icon: FieldIcon },
  Stats: { label: 'Stats', icon: RankIcon },
  Matches: { label: 'Matches', icon: MatchesIcon },

  Profile: { label: 'Profile', icon: ProfileIcon },
};

export const FloatBottomTabs = ({ state, navigation }: BottomTabBarProps) => {
  const { colors } = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outerWrapper, { paddingBottom: Math.max(insets.bottom + 8) }]}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.surface + 'e6',
            borderColor: colors.border,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const config = tabsConfig[route.name];
          if (!config) return null;

          const isFocused = state.index === index;
          const Icon = config.icon;
          const iconColor = isFocused ? colors.primary : colors.muted;

          const onPress = () => {
            if (isIOS) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item}>
              <Icon size={26} color={iconColor} strokeWidth={isFocused ? 2.8 : 2.2} />
              <View className={`w-1.5 h-1.5 rounded-full ${isFocused ? 'bg-primary' : 'bg-transparent'}`} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  pill: {
    width: '100%',
    height: PILL_HEIGHT,
    borderRadius: 24,
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: '100%',
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  centerButton: {
    width: 60,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 14,
  },
});
