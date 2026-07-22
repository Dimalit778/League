// TabsHeader.tsx
import { MenuIcon, SettingsIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { usePrimaryMember } from '@/store/MemberStore';
import { useSidebarStore } from '@/store/SidebarStore';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import { Settings, Trophy } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isIOS = Platform.OS === 'ios';
type TabsContectProps = {
  nickname: string;
  avatarUrl: string | null;
};
function TabsContect({ nickname, avatarUrl }: TabsContectProps) {
  const { colors } = useThemeTokens();
  return (
    <View className="flex-row items-center justify-between w-full">
      <Pressable
        accessibilityRole="button"
        className="h-12 w-12 items-center justify-center rounded-full bg-surfaceSoft"
        hitSlop={4}
      >
        <Settings color={colors.text} size={25} strokeWidth={1.5} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        className="h-12 w-12 items-center justify-center rounded-full bg-surfaceSoft"
        hitSlop={4}
        onPress={() => router.replace('/(app)/(user)')}
      >
        <Trophy color={colors.text} size={25} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}

export function TabsHeader({ tabsLayout = true }: { tabsLayout?: boolean }) {
  const { colors, theme } = useThemeTokens();
  const { nickname, avatarUrl } = usePrimaryMember();

  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);

  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const content = (
    <View style={{ paddingTop: insets.top }} className="bg-background">
      <View className="flex-row items-center justify-between pb-2 px-4 ">
        {tabsLayout ? (
          <View className="flex-row items-center gap-3">
            {isWeb && (
              <Pressable
                onPress={toggleSidebar}
                accessibilityRole="button"
                accessibilityLabel="Toggle menu"
                className="p-2 -ml-2 hover:bg-border rounded-lg"
              >
                <MenuIcon size={24} color={colors.primary} />
              </Pressable>
            )}
            <TabsContect nickname={nickname} avatarUrl={avatarUrl} />
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
