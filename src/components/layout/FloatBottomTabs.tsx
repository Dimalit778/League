import { FieldIcon, MatchesIcon, ProfileIcon, RankIcon, TrophyIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isIOS = Platform.OS === 'ios';

const EXTERNAL_TABS: Record<string, string> = {
  Leagues: '/(app)/(public)/myLeagues',
};

type TabConfig = {
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  isCenter?: boolean;
};

const tabsConfig: Record<string, TabConfig> = {
  Home: { label: 'Home', icon: FieldIcon },
  Stats: { label: 'Stats', icon: RankIcon },
  Matches: { label: 'Matches', icon: MatchesIcon, isCenter: true },
  Leagues: { label: 'Leagues', icon: TrophyIcon },
  Profile: { label: 'Profile', icon: ProfileIcon },
};

export const FloatBottomTabs = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors } = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outerWrapper, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
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
          const iconColor = config.isCenter ? '#fff' : isFocused ? colors.primary : colors.muted;

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
              navigation.navigate(route.name);
            }
          };

          if (config.isCenter) {
            return (
              <Pressable key={route.key} onPress={onPress} style={styles.centerWrapper}>
                <View style={[styles.centerButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                  <Icon size={24} color="#fff" strokeWidth={2.5} />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item}>
              <Icon size={24} color={iconColor} strokeWidth={isFocused ? 2.8 : 2.2} />
              <View style={[styles.dot, { backgroundColor: isFocused ? colors.primary : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const CENTER_SIZE = 56;
const CENTER_RADIUS = 18;

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
    height: 64,
    borderRadius: 28,
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
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -(CENTER_SIZE / 2 + 6),
  },
  centerButton: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 14,
  },
});
