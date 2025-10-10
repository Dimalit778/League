import { Error, LoadingOverlay } from '@/components/layout';
import {
  useGetLeagueAndMembers,
  useRemoveMember,
  useUpdateLeague,
} from '@/hooks/useLeagues';
import { useMemberStore } from '@/store/MemberStore';

import { BackButton, Button, MyImage, ProfileImage } from '@/components/ui';
import { MemberLeague } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, View } from 'react-native';

const EditLeague = () => {
  const router = useRouter();
  const { member: currentMember } = useMemberStore();
  const leagueId = currentMember?.league_id;

  const { data: league, isLoading, error } = useGetLeagueAndMembers(leagueId);
  const removeMember = useRemoveMember();
  const updateLeague = useUpdateLeague();

  const [editedLeagueName, setEditedLeagueName] = useState('');

  useEffect(() => {
    if (league?.name) {
      setEditedLeagueName(league.name);
    }
  }, [league?.name]);

  // Filter out the current member from the list
  const otherMembers = useMemo(() => {
    if (!league?.league_members || !currentMember?.user_id) return [];
    return league.league_members.filter(
      (member) => member.user_id !== currentMember.user_id
    );
  }, [league?.league_members, currentMember?.user_id]);

  const handleRemoveMember = (deletedMember: MemberLeague) => {
    if (!league || currentMember?.user_id !== league.owner_id) return;
    Alert.alert(
      'Remove Member',
      `Remove ${deletedMember.nickname} from this league?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            removeMember.mutate({
              leagueId: league.id,
              userId: deletedMember.user_id,
            }),
        },
      ]
    );
  };

  const trimmedLeagueName = editedLeagueName.trim();
  const canSaveLeagueName =
    league && trimmedLeagueName.length > 0 && trimmedLeagueName !== league.name;

  const handleSaveLeague = () => {
    const trimmedName = editedLeagueName.trim();
    if (!trimmedName) {
      Alert.alert('Validation', 'League name cannot be empty.');
      return;
    }

    if (!leagueId) {
      Alert.alert('Error', 'League not found.');
      return;
    }

    updateLeague.mutate(
      { leagueId, name: trimmedName },
      {
        onSuccess: () => {
          Alert.alert('Success', 'League updated successfully', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      }
    );
  };

  if (isLoading) return <LoadingOverlay />;
  if (error) return <Error error={error} />;
  if (!league) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-text text-lg text-center">
            League not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="Edit League" />
      {/* League Header with Competition Info */}
      <View className="p-4">
        <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
          {/* Competition Logo and Name */}
          <View className="flex-row items-center mb-4">
            <MyImage
              source={league.competition?.logo || ''}
              className="rounded-xl mr-3"
              width={40}
              height={40}
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-text text-lg font-bold">
                {league.competition?.name}
              </Text>
              <Text className="text-muted text-sm">
                {league.competition?.area_name}
              </Text>
            </View>
          </View>

          {/* Editable League Name */}
          <View className="mb-4">
            <Text className="text-text font-semibold mb-2">League Name</Text>
            <TextInput
              value={editedLeagueName}
              onChangeText={setEditedLeagueName}
              placeholder="Enter league name"
              className="text-text px-3 py-3 bg-background border border-border rounded-lg"
              keyboardType="default"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="off"
            />
          </View>
        </View>
      </View>

      {/* Members management */}
      <View className="px-4 flex-grow">
        <Text className="text-text font-semibold mb-2">Other Members</Text>
        <View className="gap-2">
          {otherMembers.length === 0 ? (
            <Text className="text-secondary italic p-2">
              No other members in this league
            </Text>
          ) : (
            otherMembers.map((member) => (
              <View
                key={member.id}
                className="flex-row items-center justify-between py-3 px-2 bg-surface rounded-lg border border-border"
              >
                <View className="flex-row items-center">
                  <View className="mr-3">
                    <ProfileImage
                      memberId={member.id}
                      path={member.avatar_url}
                      size="sm"
                      nickname={member.nickname}
                    />
                  </View>
                  <Text className="text-text font-medium">
                    {member.nickname}
                  </Text>
                </View>
                <Button
                  title={removeMember.isPending ? '...' : 'Remove'}
                  size="sm"
                  variant="error"
                  onPress={() => handleRemoveMember(member as MemberLeague)}
                  disabled={member.user_id === league.id}
                />
              </View>
            ))
          )}
        </View>
      </View>

      {/* Save/Cancel */}
      <View className="flex-row gap-3 mt-6 px-4">
        <Button
          title="Update"
          onPress={handleSaveLeague}
          loading={updateLeague.isPending}
          disabled={!canSaveLeagueName || updateLeague.isPending}
          className="flex-1 "
        />
      </View>
    </SafeAreaView>
  );
};

export default EditLeague;
