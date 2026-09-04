import { setColorAlpha } from '@/lib/color';
import { Text } from '@/components/ui/Text';
import { MatchesIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ChartNoAxesCombined, House, PodiumIcon, User } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isIOS = Platform.OS === 'ios';

const PILL_HEIGHT = 72;
const getPillHeight = (fontScale: number) => PILL_HEIGHT + Math.max(0, Math.min(fontScale, 2) - 1) * 40;
const CONTENT_BOTTOM_GAP = 16;

const getFloatBottomTabsInset = (safeAreaBottom: number, fontScale: number) =>
  getPillHeight(fontScale) + Math.max(safeAreaBottom, CONTENT_BOTTOM_GAP) + CONTENT_BOTTOM_GAP;

export const useFloatBottomTabsInset = () => {
  const insets = useSafeAreaInsets();

  const { fontScale } = useWindowDimensions();
  return getFloatBottomTabsInset(insets.bottom, fontScale);
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
    label: 'Rank',
    icon: PodiumIcon,
  },
};

export const FloatBottomTabs = ({ state, navigation }: BottomTabBarProps) => {
  const { theme, colors } = useThemeTokens();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { fontScale } = useWindowDimensions();
  const pillHeight = getPillHeight(fontScale);
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
        accessibilityLabel={t(route.name === 'Leaderboard' ? 'Leaderboard' : config.label)}
        accessibilityState={isFocused ? { selected: true } : {}}
        hitSlop={6}
        style={styles.item}
      >
        {({ pressed }) => (
          <View style={[
            styles.itemContent,
            isFocused && { backgroundColor: setColorAlpha(colors.primary, isDark ? 0.12 : 0.09) },
            pressed && styles.itemPressed,
          ]}>
            <Icon size={24} color={iconColor} strokeWidth={isFocused ? 2 : 1.6} />
            <Text size="xs" weight="semibold" numberOfLines={2} className="text-center" style={{ color: iconColor }}>
              {t(config.label)}
            </Text>
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
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: overlayColor,
              pointerEvents: 'none',
            },
          ]}
        />
      )}

      <View style={styles.tabsRow}>{tabs}</View>
    </>
  );

  return (
    <View
      style={[
        styles.outerWrapper,
        {
          paddingBottom: bottomPadding,
          pointerEvents: 'box-none',
        },
      ]}
    >
      <View
        style={[
          styles.shadowWrapper,
          {
            borderColor,
            height: pillHeight,
            boxShadow: isDark ? '0 -6px 18px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(15, 23, 42, 0.12)',
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
    borderRadius: 24,
    borderWidth: 1,
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
    paddingHorizontal: 6,
    paddingVertical: 5,
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
    borderRadius: 18,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  itemPressed: {
    opacity: 0.65,
  },
});
