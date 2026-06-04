// TabsHeader.tsx
import { MenuIcon, SettingsIcon, TrophyIcon } from '@/assets/icons';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { useSidebarStore } from '@/store/SidebarStore';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvatarImage, CText } from '../ui';

const isIOS = Platform.OS === 'ios';

export const TabsHeader = ({
  tabsLayout = true,
  isMyLeaguesPage = false,
}: {
  tabsLayout?: boolean;
  isMyLeaguesPage?: boolean;
}) => {
  const { colors, theme } = useThemeTokens();
  const activeMember = useMemberStore((s) => s.activeMember);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const content = (
    <View style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between py-2 px-4">
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
            <AvatarImage
              path={activeMember?.avatar_url}
              className="w-10 h-10 rounded-full"
              nickname={activeMember?.nickname}
            />
            <CText variant="bodyBold" className="text-primary" numberOfLines={1}>
              {activeMember?.nickname}
            </CText>
          </View>
        ) : (
          <Link href="/settings" asChild>
            <Pressable accessibilityRole="button">
              <SettingsIcon size={30} color={colors.primary} />
            </Pressable>
          </Link>
        )}

        <Link href="/myLeagues" asChild disabled={isMyLeaguesPage}>
          <Pressable accessibilityRole="button" disabled={isMyLeaguesPage}>
            <TrophyIcon size={30} color={colors.primary} />
          </Pressable>
        </Link>
      </View>
    </View>
  );

  if (isIOS) {
    return (
      <BlurView
        intensity={80}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={[styles.iosContainer, { borderBottomColor: colors.border }]}
      >
        {content}
      </BlurView>
    );
  }

  return (
    <View style={[styles.androidContainer, { backgroundColor: colors.background }]}>
      {content}
    </View>
  );
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
