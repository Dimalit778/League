import { MyImage } from '@/components/ui';
import { useUpdateLeague } from '@/hooks/useLeagues';
import { useUpdateMember } from '@/hooks/useMembers';

import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { leagueWithMembers, MemberLeague } from '@/types';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
const LeagueContent = ({
  league,
  isOwner,
}: {
  league: leagueWithMembers;
  isOwner: boolean;
}) => {
  const { member, setMember } = useMemberStore();
  const theme = useThemeTokens();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isManagingLeague, setIsManagingLeague] = useState(false);
  const [editedNickname, setEditedNickname] = useState(member?.nickname ?? '');
  const [editedName, setEditedName] = useState(league.name);
  const router = useRouter();

  const updateLeague = useUpdateLeague();
  const updateMember = useUpdateMember(member?.id as string);

  useEffect(() => {
    setEditedNickname(member?.nickname ?? '');
  }, [member?.nickname]);

  useEffect(() => {
    setEditedName(league.name);
  }, [league.name]);

  const handleUpdateLeague = useCallback(() => {
    const trimmedName = editedName?.trim();
    if (!trimmedName) {
      Alert.alert('Validation', 'League name cannot be empty.');
      return;
    }

    if (trimmedName === league.name) {
      setIsManagingLeague(false);
      return;
    }

    if (updateLeague.isPending) return;

    updateLeague.mutate(
      { leagueId: league.id, name: trimmedName },
      {
        onSuccess: () => {
          setIsManagingLeague(false);
          Alert.alert('Success', 'League updated successfully');
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      }
    );
  }, [
    editedName,
    league.id,
    league.name,
    setIsManagingLeague,
    updateLeague,
    updateLeague.isPending,
  ]);

  const handleUpdateMember = useCallback(() => {
    const trimmedNickname = editedNickname?.trim();
    if (!trimmedNickname) {
      Alert.alert('Validation', 'Please enter a nickname.');
      return;
    }

    if (trimmedNickname === member?.nickname) {
      setIsEditingNickname(false);
      return;
    }

    updateMember.mutate(trimmedNickname, {
      onSuccess: (updatedMember) => {
        setIsEditingNickname(false);
        if (updatedMember) {
          setMember(updatedMember as MemberLeague);
        }
        Alert.alert('Success', 'Profile updated successfully');
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    });
  }, [editedNickname, member, setIsEditingNickname, setMember, updateMember]);

  const handleCopyJoinCode = async () => {
    if (typeof league.join_code === 'string') {
      await Clipboard.setStringAsync(league.join_code || '');
      Alert.alert('Copied!', 'Join code copied to clipboard.');
    }
  };

  const trimmedNickname = editedNickname.trim();
  const canSaveNickname =
    trimmedNickname.length > 0 && trimmedNickname !== (member?.nickname ?? '');
  const trimmedLeagueName = editedName.trim();
  const canSaveLeagueName =
    trimmedLeagueName.length > 0 && trimmedLeagueName !== league.name;

  return (
    <View className="flex-grow mt-4">
      <View className="bg-surface rounded-2xl border border-border p-3">
        {/* League name */}
        <View className="flex-row items-center mb-4">
          <MyImage
            source={league.competition?.logo || ''}
            className="rounded-xl mr-3"
            width={40}
            height={40}
            resizeMode="contain"
          />

          <View className="flex-1 ps-4">
            {isOwner && isManagingLeague ? (
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                placeholder="League name"
                className="flex-1 text-text px-2 bg-surface border border-border rounded-lg"
                keyboardType="default"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
                autoFocus
              />
            ) : (
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text
                    className="text-text text-xl font-bold"
                    numberOfLines={1}
                  >
                    {league.name}
                  </Text>
                  <Text className="text-muted text-xs">
                    {league.competition?.name} • {league.competition?.area}
                  </Text>
                </View>
                {isOwner && (
                  <TouchableOpacity
                    onPress={() => router.push('/profile/edit-league')}
                  >
                    <FontAwesome6
                      name="pen-to-square"
                      size={16}
                      color={theme.colors.secondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        <View className="h-[1px] bg-border my-3" />
        {/* League details */}
        <View className="gap-3">
          {!isManagingLeague && (
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
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default LeagueContent;
