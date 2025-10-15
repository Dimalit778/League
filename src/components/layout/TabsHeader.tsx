import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { SettingsIcon, TrophyIcon } from '@assets/icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabsHeader = ({
  showLeagueName = true,
}: {
  showLeagueName?: boolean;
}) => {
  const { colors } = useThemeTokens();
  const member = useMemberStore((s) => s.member?.league);
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background"
      style={{
        paddingTop: insets.top,
      }}
    >
      <View className="flex-row items-center justify-between py-3 px-4">
        <Link href="/(app)/(public)/settings" asChild>
          <Pressable accessibilityRole="button">
            <SettingsIcon size={30} color={colors.primary} />
          </Pressable>
        </Link>

        {showLeagueName && (
          <Text className="font-bold  text-2xl text-primary" numberOfLines={1}>
            {member?.name}
          </Text>
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
