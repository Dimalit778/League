import { LogoBadge } from '@/components/LogoBadge';
import { MyImage } from '@/components/ui';

import { useThemeTokens } from '@/hooks/useThemeTokens';
import { LeagueWithMembersType } from '@/types';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, Text, TouchableOpacity, View } from 'react-native';

export const LeagueDetailsSection = ({
  league,
  memberUserId,
}: {
  league: LeagueWithMembersType;
  memberUserId: string;
}) => {
  const { colors } = useThemeTokens();

  const handleCopyJoinCode = async () => {
    if (typeof league.join_code === 'string') {
      await Clipboard.setStringAsync(league.join_code || '');
      Alert.alert('Copied!', 'Join code copied to clipboard.');
    }
  };
  const owner = useMemo(() => {
    return league.league_members.find((member: { user_id: string }) => member.user_id === league.owner_id);
  }, [league.league_members, league.owner_id]);

  return (
    <View className="flex-grow justify-center px-4 mt-4">
      <View className="bg-surface rounded-2xl border border-border py-2 px-3">
        <View className="flex-row justify-between items-center ">
          <LogoBadge source={{ uri: league?.competition?.logo || '' }} width={50} height={50} />

          <Text
            className="text-primary font-nunito-bold text-2xl text-center uppercase tracking-widest"
            style={{
              textShadowRadius: 2,
              letterSpacing: 4,
            }}
          >
            {league.name}
          </Text>

          {league.owner_id === memberUserId && (
            <Link href="/profile/edit-league" asChild>
              <TouchableOpacity className="p-2">
                <FontAwesome6 name="pen-to-square" size={16} color={colors.secondary} />
              </TouchableOpacity>
            </Link>
          )}
        </View>

        <View className="h-[1px] bg-muted my-3" />

        <View className="gap-3">
          {/* Join Code */}
          <View className="flex-row items-center justify-between">
            <Text className="text-text font-medium">Join Code</Text>
            <Pressable className="border border-border rounded-lg px-3 py-1" onPress={handleCopyJoinCode}>
              <Text className="text-text tracking-[2px] text-center">{league.join_code}</Text>
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
            <Text className="text-text font-semibold">{owner?.nickname || 'Unknown'}</Text>
          </View>
          <View className="h-[1px] bg-border" />

          {/* Competition details */}
          <View className="flex-row justify-between">
            <Text className="text-text">League</Text>
            <View className="flex-row items-center">
              <Text className="text-text font-semibold mr-2">{league.competition.name}</Text>
              <LogoBadge source={{ uri: league.competition.logo }} width={18} height={18} />
            </View>
          </View>
          <View className="h-[1px] bg-border" />

          <View className="flex-row justify-between items-center">
            <Text className="text-text">Country</Text>
            <View className="flex-row items-center">
              <Text className="text-text font-semibold mr-2">{league.competition.area}</Text>
              <MyImage source={{ uri: league.competition.flag }} width={18} height={18} resizeMode="contain" />
            </View>
          </View>

          <View className="h-[1px] bg-border" />

          {/* Created date */}
          <View className="flex-row justify-between">
            <Text className="text-text font-medium">Created at</Text>
            <Text className="text-muted">{new Date(league.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
