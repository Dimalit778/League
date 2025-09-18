import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingsIcon, TrophyIcon } from '../../../assets/icons';

const TabsHeader = ({
  showLeagueName = true,
}: {
  showLeagueName?: boolean;
}) => {
  const { member } = useMemberStore();
  const { colors } = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }} className="bg-background">
      <View className="flex-row items-center justify-between py-2 px-4">
        <Link href="/settings" asChild>
          <Pressable accessibilityRole="button">
            <SettingsIcon size={30} color={colors.primary} />
          </Pressable>
        </Link>

        {showLeagueName && (
          <Text className="font-bold  text-2xl text-primary" numberOfLines={1}>
            {member?.league?.name}
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
