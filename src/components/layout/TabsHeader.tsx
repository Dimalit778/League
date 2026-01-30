// TabsHeader.tsx
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { useSidebarStore } from '@/store/SidebarStore';
import { MenuIcon, SettingsIcon, TrophyIcon } from '@assets/icons';
import { Link } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvatarImage } from '../ui';

export const TabsHeader = ({ tabsLayout = true }: { tabsLayout?: boolean }) => {
  const { colors } = useThemeTokens();
  const activeMember = useMemberStore((s) => s.activeMember);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);

  const insets = useSafeAreaInsets();
  const token = useThemeTokens();

  const isWeb = Platform.OS === 'web';

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: token.colors.background,
      }}
    >
      <View className="flex-row items-center justify-between py-2 px-4">
        {tabsLayout ? (
          <View className="flex-row items-center gap-3">
            {/* Hamburger Menu Button - Desktop Web Only */}
            {isWeb && (
              <Pressable
                onPress={() => {
                  toggleSidebar();
                }}
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
            <Text className="font-bold text-lg text-primary" numberOfLines={1}>
              {activeMember?.nickname}
            </Text>
          </View>
        ) : (
          <Link href="/settings" asChild>
            <Pressable accessibilityRole="button">
              <SettingsIcon size={30} color={colors.primary} />
            </Pressable>
          </Link>
        )}

        <Link href="/myLeagues" asChild>
          <Pressable accessibilityRole="button">
            <TrophyIcon size={30} color={colors.primary} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
};
