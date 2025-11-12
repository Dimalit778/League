import { MyImage } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { leagueWithMembers } from '@/types';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, Text, TouchableOpacity, View } from 'react-native';

export const LeagueDetailsSection = ({
  league,
  memberUserId,
}: {
  league: leagueWithMembers;
  memberUserId: string;
}) => {
  const { colors } = useThemeTokens();
  console.log('league', JSON.stringify(league, null, 2));

  const handleCopyJoinCode = async () => {
    if (typeof league.join_code === 'string') {
      await Clipboard.setStringAsync(league.join_code || '');
      Alert.alert('Copied!', 'Join code copied to clipboard.');
    }
  };
  const owner = useMemo(() => {
    return league.league_members.find(
      (member) => member.user_id === league.owner_id
    );
  }, [league.league_members, league.owner_id]);

  return (
    <View className="flex-grow justify-center px-4 mt-4">
      <View className="bg-surface rounded-2xl border border-border p-4">
        <View className="flex-row justify-between items-center px-4">
          <MyImage
            source={league?.competition?.logo || ''}
            className="rounded-xl mr-3"
            width={40}
            height={40}
            resizeMode="contain"
          />
          <View>
            <Text
              className="text-primary font-extrabold text-2xl text-center uppercase tracking-widest"
              style={{
                textShadowRadius: 2,
                letterSpacing: 4,
              }}
            >
              {league.name}
            </Text>
          </View>
          {league.owner_id === memberUserId && (
            <TouchableOpacity
              onPress={() => router.push('/profile/edit-league')}
            >
              <FontAwesome6
                name="pen-to-square"
                size={16}
                color={colors.secondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View className="h-[1px] bg-muted my-3" />

        {/* League details */}
        <View className="gap-3">
          {/* Join Code */}
          <View className="flex-row items-center justify-between">
            <Text className="text-text font-medium">Join Code</Text>
            <Pressable
              className="border border-border rounded-lg px-3 py-2"
              onPress={handleCopyJoinCode}
            >
              <Text className="text-text tracking-[2px] text-center">
                {league.join_code}
              </Text>
            </Pressable>
          </View>
          <View className="h-[1px] bg-border" />

          {/* Members */}
          <View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-text">Members</Text>
              <Text className="text-text font-semibold">
                {league?.league_members.length || 0} / {league?.max_members}
              </Text>
            </View>
          </View>
          <View className="h-[1px] bg-border" />

          {/* Owner */}
          <View className="flex-row justify-between">
            <Text className="text-text">League Owner</Text>
            <Text className="text-text font-semibold">
              {owner?.nickname || 'Unknown'}
            </Text>
          </View>
          <View className="h-[1px] bg-border" />

          {/* Competition details */}
          <View className="flex-row justify-between">
            <Text className="text-text">League</Text>
            <View className="flex-row items-center">
              <Text className="text-text font-semibold mr-2">
                {league.competition.name}
              </Text>
              <MyImage
                source={{ uri: league.competition.logo }}
                width={18}
                height={18}
                resizeMode="contain"
              />
            </View>
          </View>
          <View className="h-[1px] bg-border" />

          <View className="flex-row justify-between items-center">
            <Text className="text-text">Country</Text>
            <View className="flex-row items-center">
              <Text className="text-text font-semibold mr-2">
                {league.competition.area}
              </Text>
              <MyImage
                source={{ uri: league.competition.flag }}
                width={18}
                height={18}
                resizeMode="contain"
              />
            </View>
          </View>

          <View className="h-[1px] bg-border" />

          {/* Created date */}
          <View className="flex-row justify-between">
            <Text className="text-text font-medium">Created at</Text>
            <Text className="text-muted">
              {new Date(league.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
