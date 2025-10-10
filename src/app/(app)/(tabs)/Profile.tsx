import { LoadingOverlay } from '@/components/layout';
import { Button, MyImage, ProfileImage } from '@/components/ui';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/hooks/useLeagues';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Profile() {
  const { member } = useMemberStore();
  const { colors } = useThemeTokens();
  const leagueId = member?.league_id;
  const userId = member?.user_id;

  const leaveLeague = useLeaveLeague(userId ?? '');

  const { data: league, isLoading } = useGetLeagueAndMembers(leagueId);

  const isOwner = useMemo(
    () =>
      Boolean(
        member?.user_id &&
          league?.owner?.user_id &&
          member.user_id === league.owner.user_id
      ),
    [member?.user_id, league?.owner?.user_id]
  );

  const confirmLeaveLeague = useCallback(() => {
    if (!league?.id) return;
    Alert.alert(
      'Leave League',
      `Are you sure you want to leave "${league?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () =>
            leaveLeague.mutate(league.id, {
              onSuccess: () => {
                router.push('/(app)/(tabs)/League');
              },
              onError: (error) => {
                Alert.alert('Error', error.message);
              },
            }),
        },
      ]
    );
  }, [leaveLeague, league?.id, league?.name]);

  if (!member || !league) return <LoadingOverlay />;

  const handleCopyJoinCode = async () => {
    if (typeof league.join_code === 'string') {
      await Clipboard.setStringAsync(league.join_code || '');
      Alert.alert('Copied!', 'Join code copied to clipboard.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background ">
      {isLoading && <LoadingOverlay />}
      {/* Member avatar */}
      <View className="mt-4 items-center ">
        <View className="relative">
          <ProfileImage
            memberId={member.id}
            path={member.avatar_url}
            nickname={member.nickname}
            size="xl"
            style={{ width: 120, height: 120 }}
          />

          <TouchableOpacity
            onPress={() => router.push('/profile/edit-profile')}
            className="absolute -right-2 -bottom-2 rounded-full w-9 h-9 items-center justify-center border border-border z-10"
            style={{
              boxShadow:
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            <FontAwesome6
              name="pen-to-square"
              size={16}
              color={colors.secondary}
            />
          </TouchableOpacity>
        </View>
        <Text className="text-xl text-muted font-semibold text-center mt-4">
          {member.nickname}
        </Text>
      </View>

      {/* League details */}
      <View className="flex-grow justify-center px-4">
        <View className=" bg-surface rounded-2xl border border-border p-4">
          <View className="flex-row justify-between items-center px-4">
            <MyImage
              source={league?.competition?.logo || ''}
              className="rounded-xl mr-3"
              width={40}
              height={40}
              resizeMode="contain"
            />
            <Text className="flex-1 text-text text-xl text-center   uppercase">
              {league.name}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/profile/edit-league')}
            >
              <FontAwesome6
                name="pen-to-square"
                size={16}
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>

          <View className="h-[1px] bg-muted my-3" />
          {/* League details */}
          <View className="gap-3">
            {/* Join Code */}
            <View className="flex-row items-center justify-between ">
              <Text className="text-text font-medium">Join Code</Text>

              <Pressable
                className="border border-border rounded-lg px-3 py-2"
                onPress={handleCopyJoinCode}
              >
                <Text className="text-text  tracking-[2px] text-center ">
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
                {league.owner?.nickname || 'Unknown'}
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
                  {league.competition.country}
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
      {/* Leave League Button */}
      <View className="mt-auto mb-4 px-6">
        <Button
          title={'Leave League'}
          variant="error"
          onPress={confirmLeaveLeague}
          disabled={leaveLeague.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
