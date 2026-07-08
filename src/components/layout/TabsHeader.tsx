// TabsHeader.tsx
import { MenuIcon, SettingsIcon, TrophyIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { usePrimaryMember } from '@/store/MemberStore';
import { useSidebarStore } from '@/store/SidebarStore';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import { BellIcon } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvatarImage, Text } from '../ui';

const isIOS = Platform.OS === 'ios';
type TabsContectProps = {
  nickname: string;
  avatarUrl: string | null;
};
function TabsContect({ nickname, avatarUrl }: TabsContectProps) {
  const { colors } = useThemeTokens();
  return (
    <View className="flex-row items-center justify-between w-full">
      <View className="flex-row items-center gap-3">
        <AvatarImage nickname={nickname} path={avatarUrl} className="w-12 h-12" />

        <Text className="text-xs uppercase tracking-widest text-text" numberOfLines={1}>
          {nickname}
        </Text>
      </View>
      <View className="flex-row items-center gap-1 ">
        <Pressable accessibilityRole="button" className="p-2 rounded-full border border-border muted">
          <BellIcon color={colors.muted} size={24} strokeWidth={1.5} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          className="p-2 rounded-full border border-border muted"
          onPress={() => router.replace('/(app)/(user)')}
        >
          <TrophyIcon color={colors.muted} size={24} />
        </Pressable>
      </View>
    </View>
  );
}

export const TabsHeader = ({ tabsLayout = true }: { tabsLayout?: boolean }) => {
  const { colors, theme } = useThemeTokens();
  const { nickname, avatarUrl } = usePrimaryMember();

  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);

  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const content = (
    <View style={{ paddingTop: insets.top }} className="bg-background">
      <View className="flex-row items-center justify-between py-2 px-4 ">
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
};

const styles = StyleSheet.create({
  iosContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  androidContainer: {
    elevation: 4,
    shadowColor: '#000',
  },
});
