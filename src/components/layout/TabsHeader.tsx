import { MenuIcon, SettingsIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useSidebarStore } from '@/store/SidebarStore';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MobileTopBar } from './TopTabBar';

const isIOS = Platform.OS === 'ios';

export function TabsHeader({ tabsLayout = true }: { tabsLayout?: boolean }) {
  const { colors, theme } = useThemeTokens();
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const content = (
    <View style={{ paddingTop: insets.top }} className="bg-background">
      <View className="flex-row items-center justify-between px-4 pb-2">
        {tabsLayout ? (
          <View className="w-full flex-row items-center gap-3">
            {isWeb && (
              <Pressable
                onPress={toggleSidebar}
                accessibilityRole="button"
                accessibilityLabel="Toggle menu"
                className="-ml-2 rounded-lg p-2 hover:bg-border"
              >
                <MenuIcon size={24} color={colors.primary} />
              </Pressable>
            )}
            <View className="min-w-0 flex-1">
              <MobileTopBar />
            </View>
          </View>
        ) : (
          <Link href="/settings" asChild>
            <Pressable accessibilityRole="button">
              <SettingsIcon size={30} color={colors.primary} />
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  );

  if (isIOS) {
    return (
      <BlurView
        intensity={80}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={[styles.iosContainer, { borderBottomColor: colors.surface }]}
      >
        {content}
      </BlurView>
    );
  }

  return <View style={[styles.androidContainer, { backgroundColor: colors.background }]}>{content}</View>;
}

const styles = StyleSheet.create({
  iosContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  androidContainer: {
    elevation: 4,
    shadowColor: '#000',
  },
});
