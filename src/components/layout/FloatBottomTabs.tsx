import { MatchesIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ChartNoAxesCombined, House, PodiumIcon, User } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isIOS = Platform.OS === 'ios';

const PILL_HEIGHT = 64;
// const height = 48px;
// const iconWidth = 72px;
const CONTENT_BOTTOM_GAP = 16;

const getFloatBottomTabsInset = (safeAreaBottom: number) => PILL_HEIGHT + safeAreaBottom + CONTENT_BOTTOM_GAP;

export const useFloatBottomTabsInset = () => {
  const insets = useSafeAreaInsets();

  return Platform.OS === 'web' ? 0 : getFloatBottomTabsInset(insets.bottom);
};

type TabConfig = {
  label: string;
  icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth?: number;
  }>;
};

const tabsConfig: Record<string, TabConfig> = {
  index: {
    label: 'Home',
    icon: House,
  },
  Stats: {
    label: 'Stats',
    icon: ChartNoAxesCombined,
  },
  Matches: {
    label: 'Matches',
    icon: MatchesIcon,
  },
  Profile: {
    label: 'Profile',
    icon: User,
  },
  Leaderboard: {
    label: 'Leaderboard',
    icon: PodiumIcon,
  },
};

export const FloatBottomTabs = ({ state, navigation }: BottomTabBarProps) => {
  const { theme, colors } = useThemeTokens();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const isDark = theme === 'dark';

  const tabs = state.routes.map((route, index) => {
    const config = tabsConfig[route.name];

    if (!config) return null;

    const isFocused = state.index === index;
    const Icon = config.icon;

    const iconColor = isFocused ? colors.primary : colors.muted;

    const onPress = () => {
      if (isIOS) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };
    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="tab"
        accessibilityLabel={t(config.label)}
        accessibilityState={isFocused ? { selected: true } : {}}
        hitSlop={6}
        style={styles.item}
      >
        {({ pressed }) => (
          <View style={[styles.itemContent, pressed && styles.itemPressed]}>
            <Icon size={26} color={iconColor} strokeWidth={isFocused ? 1.8 : 1.5} />

            <View
              style={[
                styles.activeDot,
                {
                  backgroundColor: isFocused ? colors.primary : 'transparent',
                },
              ]}
            />
          </View>
        )}
      </Pressable>
    );
  });

  const bottomPadding = Math.max(insets.bottom, CONTENT_BOTTOM_GAP);

  const borderColor = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.10)';

  const overlayColor = isDark ? 'rgba(11, 17, 32, 0.72)' : 'rgba(255, 255, 255, 0.68)';

  const fallbackBackground = isDark ? 'rgba(17, 24, 39, 0.97)' : 'rgba(255, 255, 255, 0.97)';

  const content = (
    <>
      {isIOS && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: overlayColor,
            },
          ]}
        />
      )}

      <View style={styles.tabsRow}>{tabs}</View>
    </>
  );

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outerWrapper,
        {
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <View
        style={[
          styles.shadowWrapper,
          {
            borderColor: borderColor,
          },
        ]}
      >
        {isIOS ? (
          <BlurView intensity={75} tint={isDark ? 'dark' : 'light'} style={styles.pill}>
            {content}
          </BlurView>
        ) : (
          <View
            style={[
              styles.pill,
              {
                backgroundColor: fallbackBackground,
              },
            ]}
          >
            {content}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  shadowWrapper: {
    width: '100%',
    maxWidth: 720,
    height: PILL_HEIGHT,
    borderRadius: 24,
    borderWidth: 1,
    boxShadow: '0 -6px 18px rgba(0, 0, 0, 0.4)',
  },

  pill: {
    flex: 1,
    borderRadius: 23,
    overflow: 'hidden',
  },

  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  itemContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  itemPressed: {
    opacity: 0.65,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
