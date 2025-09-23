import { LoadingOverlay, Screen } from '@/components/layout';
import LeagueContent from '@/components/profile/LeagueContent';
import { Button, ProfileImage } from '@/components/ui';
import { useGetLeagueAndMembers, useLeaveLeague } from '@/hooks/useLeagues';
import { useUploadMemberImage } from '@/hooks/useMembers';
import { useMemberStore } from '@/store/MemberStore';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const { member } = useMemberStore();
  const leagueId = member?.league_id as string;
  const memberId = member?.id as string;

  const leaveLeague = useLeaveLeague(memberId);
  const uploadImage = useUploadMemberImage(leagueId, memberId);
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
  const confirmLeaveLeague = () => {
    Alert.alert(
      'Leave League',
      `Are you sure you want to leave "${league?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () =>
            leaveLeague.mutate(league?.id as string, {
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
  };
  const onSelectImage = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
    };
    let result = await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && uploadImage) {
      const img = result.assets[0];
      uploadImage.mutateAsync(img, {
        onSuccess: () => {
          Alert.alert('Success', 'Profile image updated successfully');
        },
        onError: () => {
          Alert.alert('Error', 'Failed to update profile image');
        },
      });
    }
  };

  return (
    <Screen className="mx-2 my-1">
      {isLoading && <LoadingOverlay />}
      <View className="flex-row items-center justify-center mb-4">
        <View className="relative">
          <ProfileImage
            path={member?.avatar_url as string}
            nickname={member?.nickname as string}
            className="rounded-full w-36 h-36"
          />
          <TouchableOpacity
            onPress={onSelectImage}
            className="absolute -right-2 -bottom-2 bg-primary rounded-full w-7 h-7 items-center justify-center border border-border z-10 shadow-md"
          >
            <FontAwesome name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {league && <LeagueContent league={league} isOwner={isOwner} />}

      <View className="mt-auto mb-6">
        <Button
          title={'Leave League'}
          variant="error"
          onPress={confirmLeaveLeague}
          disabled={leaveLeague.isPending}
        />
      </View>
    </Screen>
  );
}
