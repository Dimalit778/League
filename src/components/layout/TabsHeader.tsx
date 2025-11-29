import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { useGetLeagueWithCompetition } from '@/features/leagues/hooks/useLeagues';
import { SettingsIcon, TrophyIcon } from '@assets/icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabsHeader = ({ showLeagueName = true }: { showLeagueName?: boolean }) => {
  const { colors } = useThemeTokens();
  const leagueId = useMemberStore((s) => s.leagueId);
  const { data: league } = useGetLeagueWithCompetition(leagueId ?? undefined);
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
            {league?.name}
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
