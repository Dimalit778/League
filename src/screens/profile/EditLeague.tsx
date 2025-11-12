import { Error, LoadingOverlay } from '@/components/layout';
import {
  useGetLeagueAndMembers,
  useRemoveMember,
  useUpdateLeague,
} from '@/hooks/useLeagues';
import { useMemberStore } from '@/store/MemberStore';

import { AvatarImage, BackButton, Button, MyImage } from '@/components/ui';
import { MemberLeague } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditLeagueScreen = () => {
  const { member, league } = useMemberStore();

  const {
    data: leagueData,
    isLoading,
    error,
  } = useGetLeagueAndMembers(league?.id);

  const removeMember = useRemoveMember();
  const updateLeague = useUpdateLeague();

  // Sort members to display owner first
  const sortedMembers = useMemo(() => {
    if (!leagueData?.league_members || !leagueData?.owner_id) {
      return [];
    }
    return [...leagueData.league_members].sort((a, b) => {
      const aIsOwner = a.user_id === leagueData.owner_id;
      const bIsOwner = b.user_id === leagueData.owner_id;
      if (aIsOwner && !bIsOwner) return -1;
      if (!aIsOwner && bIsOwner) return 1;
      return 0;
    });
  }, [leagueData?.league_members, leagueData?.owner_id]);

  const [editedLeagueName, setEditedLeagueName] = useState('');

  useEffect(() => {
    if (league?.name) {
      setEditedLeagueName(league.name);
    }
  }, [league?.name]);

  const handleRemoveMember = (deletedMember: MemberLeague) => {
    if (!league || member?.user_id !== league.owner_id) return;
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
    leagueData &&
    trimmedLeagueName.length > 0 &&
    trimmedLeagueName !== leagueData.name;

  const handleSaveLeague = () => {
    const trimmedName = editedLeagueName.trim();
    if (!trimmedName) {
      Alert.alert('Validation', 'League name cannot be empty.');
      return;
    }

    updateLeague.mutate(
      { leagueId: leagueData?.id, name: trimmedName },
      {
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      }
    );
  };
  const MemberCard = ({ member }: { member: MemberLeague }) => {
    const isOwner = member.user_id === leagueData?.owner_id;
    return (
      <View className="flex-row items-center justify-between py-3 px-2 bg-surface rounded-lg border border-border">
        <View className="flex-row items-center flex-1">
          <View className="mr-3 w-10 h-10 rounded-full overflow-hidden">
            <AvatarImage
              nickname={member.nickname}
              path={member.avatar_url ?? null}
            />
          </View>
          <View className="flex-1">
            <Text className="text-text font-medium">{member.nickname}</Text>
            {isOwner && <Text className="text-muted text-xs">Owner</Text>}
          </View>
        </View>
        {!isOwner && (
          <Button
            title={removeMember.isPending ? '...' : 'Remove'}
            size="sm"
            variant="error"
            onPress={() => handleRemoveMember(member as MemberLeague)}
          />
        )}
      </View>
    );
  };

  if (isLoading || !leagueData) return <LoadingOverlay />;
  if (error) return <Error error={error} />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="Edit League" />

      <View className="p-4">
        <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
          {/* Competition Logo and Name */}
          <View className="flex-row items-center mb-4">
            <MyImage
              source={leagueData.competition?.logo || ''}
              className="rounded-xl mr-3"
              width={40}
              height={40}
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-text text-lg font-bold">
                {leagueData.competition?.name}
              </Text>
              <Text className="text-muted text-sm">
                {leagueData.competition?.area}
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

      <FlatList
        data={sortedMembers}
        renderItem={({ item }) => <MemberCard member={item as MemberLeague} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      />

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

export default EditLeagueScreen;
