import { LoadingOverlay, Screen } from '@/components/layout';
import LeagueContent from '@/components/profile/LeagueContent';
import { Button, ProfileImage } from '@/components/ui';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/hooks/useLeagues';
import { useDeleteMemberImage, useUploadMemberImage } from '@/hooks/useMembers';
import { useMemberStore } from '@/store/MemberStore';
import { MemberLeague } from '@/types';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Profile() {
  const member = useMemberStore((state) => state.member);
  const setMember = useMemberStore((state) => state.setMember);
  const screenHeight = Dimensions.get('window').height;

  console.log('screenHeight', screenHeight);

  const leagueId = member?.league_id;
  const memberId = member?.id;
  const userId = member?.user_id;

  const leaveLeague = useLeaveLeague(userId ?? '');
  const uploadImage = useUploadMemberImage(leagueId ?? '', memberId ?? '');
  const deleteImage = useDeleteMemberImage(leagueId ?? '', memberId ?? '');
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

  const handleSelectImage = useCallback(async () => {
    if (!leagueId || !memberId) return;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) return;

    const [asset] = result.assets;
    if (!asset) return;

    try {
      const updatedMember = (await uploadImage.mutateAsync(asset)) as
        | MemberLeague
        | undefined;
      if (updatedMember) {
        setMember(updatedMember);
      }
      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Failed to update profile image:', error);
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to update profile image'
      );
    }
  }, [leagueId, memberId, uploadImage, setMember]);

  const confirmRemoveImage = useCallback(() => {
    if (!member?.avatar_url || !leagueId || !memberId) return;

    Alert.alert('Remove Image', 'Remove your profile image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedMember = (await deleteImage.mutateAsync(
              member.avatar_url
            )) as MemberLeague | undefined;
            if (updatedMember) {
              setMember(updatedMember);
            }
            Alert.alert('Removed', 'Profile image removed');
          } catch (error) {
            console.error('Failed to remove profile image:', error);
            Alert.alert(
              'Error',
              error instanceof Error
                ? error.message
                : 'Failed to remove profile image'
            );
          }
        },
      },
    ]);
  }, [deleteImage, leagueId, member?.avatar_url, memberId, setMember]);

  const isMutatingAvatar = uploadImage.isPending || deleteImage.isPending;

  if (!member) {
    return (
      <Screen className="mx-2 my-1 items-center justify-center">
        <LoadingOverlay />
      </Screen>
    );
  }

  return (
    <Screen className="mx-2 my-1">
      <View className="flex-1">
        {isLoading && <LoadingOverlay />}
        {/* Member avatar */}
        <View className="flex-row items-center justify-center mb-4">
          <View className="relative">
            <ProfileImage
              memberId={member.id}
              path={member.avatar_url}
              nickname={member.nickname}
              size="xl"
              style={{ width: 144, height: 144 }}
            />
            {member.avatar_url && (
              <TouchableOpacity
                onPress={confirmRemoveImage}
                disabled={isMutatingAvatar}
                className="absolute -left-2 -bottom-2 bg-background rounded-full w-8 h-8 items-center justify-center border border-border z-10 shadow-md"
              >
                {deleteImage.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <FontAwesome name="trash" size={14} color="#ef4444" />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSelectImage}
              disabled={isMutatingAvatar}
              className="absolute -right-2 -bottom-2 bg-primary rounded-full w-9 h-9 items-center justify-center border border-border z-10 shadow-md"
            >
              {uploadImage.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <FontAwesome name="plus" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {league && <LeagueContent league={league} isOwner={isOwner} />}

        <View className="mt-auto mb-6 pt-6">
          <Button
            title={'Leave League'}
            variant="error"
            onPress={confirmLeaveLeague}
            disabled={leaveLeague.isPending}
          />
        </View>
      </View>
    </Screen>
  );
}
