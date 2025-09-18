import { Button, Image } from '@/components/ui';
import { useUpdateLeague } from '@/hooks/useLeagues';

import { leagueWithMembers } from '@/types';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import EditLeague from './EditLeague';

const LeagueContent = ({
  league,
  isOwner,
}: {
  league: leagueWithMembers;
  isOwner: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(league.name);
  const updateLeague = useUpdateLeague();

  useEffect(() => {
    setEditedName(league.name);
  }, [league.name, isEditing]);

  const handleUpdateLeague = () => {
    updateLeague.mutate({ leagueId: league.id, name: editedName });

    setIsEditing(false);
  };

  const handleCopyJoinCode = async () => {
    if (typeof league.join_code === 'string') {
      await Clipboard.setStringAsync(league.join_code || '');
      Alert.alert('Copied!', 'Join code copied to clipboard.');
    }
  };

  return (
    <View className="flex-grow">
      <View className="bg-surface rounded-2xl border border-border p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-text text-xl ">League</Text>

          {isOwner && !isEditing && (
            <Button
              title="Edit"
              variant="secondary"
              size="sm"
              onPress={() => setIsEditing(true)}
            />
          )}
        </View>
        {/* League header with logo */}
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: league.competition.logo }}
            className="rounded-xl mr-3"
            width={40}
            height={40}
            resizeMode="contain"
          />

          <View className="flex-1 ps-4">
            {isEditing ? (
              <TextInput
                value={editedName}
                onChangeText={(text) => setEditedName(text)}
                placeholder="League name"
                className="flex-1 text-text px-2  bg-surface border border-border rounded-lg"
                keyboardType="default"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
                autoFocus
              />
            ) : (
              <>
                <Text className="text-text text-xl font-bold">
                  {league.name}
                </Text>
                <Text className="text-muted text-xs">
                  {league.competition?.name} • {league.competition?.country}
                </Text>
              </>
            )}
          </View>
        </View>

        <View className="h-[1px] bg-border my-3" />
        {/* League details */}
        <View className="gap-3">
          {!isEditing ? (
            <>
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
                  <Image
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
                  <Image
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
            </>
          ) : (
            <EditLeague
              league={league}
              closeEditMode={() => setIsEditing(false)}
              handleUpdateLeague={handleUpdateLeague}
              updating={updateLeague.isPending}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default LeagueContent;
