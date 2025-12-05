import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { SettingsIcon, TrophyIcon } from '@assets/icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvatarImage } from '../ui';

const TabsHeader = ({ tabsLayout = true }: { tabsLayout?: boolean }) => {
  const { colors } = useThemeTokens();
  const activeMember = useMemberStore((s) => s.activeMember);
  console.log('activeMember', JSON.stringify(activeMember, null, 2));

  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background"
      style={{
        paddingTop: insets.top,
      }}
    >
      <View className="flex-row items-center justify-between py-3 px-4">
        {tabsLayout ? (
          <View className="flex-row items-center gap-3">
            <AvatarImage
              path={activeMember?.avatar_url}
              className="w-10 h-10 rounded-full"
              nickname={activeMember?.nickname}
            />
            <Text className="font-bold  text-lg text-primary" numberOfLines={1}>
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

export default TabsHeader;
