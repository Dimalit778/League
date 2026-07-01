// TabsHeader.tsx
import { MenuIcon, SettingsIcon, TrophyIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { useSidebarStore } from '@/store/SidebarStore';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvatarImage, CText } from '../ui';

const isIOS = Platform.OS === 'ios';
type TabsContectProps = {
  nickname: string | null | undefined;
  avatar_url: string | null | undefined;
  color: string;
};
function TabsContect({ nickname, avatar_url, color }: TabsContectProps) {
  return (
    <>
      <View className="flex-1 flex-row items-center gap-3">
        <AvatarImage path={avatar_url} className="w-10 h-10 rounded-full" nickname={nickname} />
        <CText variant="bodyBold" className="text-primary" numberOfLines={1}>
          {nickname}
        </CText>
      </View>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/(app)/(public)/myLeagues')}>
        <TrophyIcon color={color} size={24} />
      </Pressable>
    </>
  );
}

export const TabsHeader = ({ tabsLayout = true }: { tabsLayout?: boolean }) => {
  const { colors, theme } = useThemeTokens();
  const activeMember = useMemberStore((s) => s.activeMember);
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
            <TabsContect
              nickname={activeMember?.nickname}
              avatar_url={activeMember?.avatar_url}
              color={colors.primary}
            />
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
