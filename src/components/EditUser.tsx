import { useUploadMemberImage } from '@/hooks/useMembers';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useUpdateUser } from '@/hooks/useUsers';
import { useMemberStore } from '@/store/MemberStore';
import { TablesUpdate } from '@/types/database.types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingOverlay } from './layout';

const EditUser = () => {
  const { member } = useMemberStore();
  const theme = useThemeTokens();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>('');

  const memberId = member?.id as string;
  const leagueId = member?.league_id as string;
  const avatarUrl = member?.avatar_url as string;

  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  // const { data: avatar, isLoading: isLoadingAvatar } =
  //   useMemberAvatar(avatarPath);

  const uploadImage = useUploadMemberImage(leagueId, memberId);

  const handleSaveChanges = async () => {
    try {
      const updates: TablesUpdate<'users'> = {
        full_name: name,
      };

      await updateUser({ updates });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (uploadImage.isPending) return <LoadingOverlay />;

  return (
    <View className="flex-row p-4  bg-surface rounded-xl border border-border items-center">
      <View className="flex-grow pl-4 gap-4">
        {isEditing ? (
          <>
            <TextInput
              className="bg-background text-text p-2 rounded-md border border-border"
              value={member?.nickname}
              onChangeText={setName}
              placeholder="Enter your nickname"
              placeholderTextColor="#888"
            />
            <View className="flex-row justify-end ">
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                className="bg-surface border border-border rounded-md px-3 py-1 mr-2"
              >
                <Text className="text-text">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveChanges}
                className="bg-primary rounded-md px-3 py-1"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-background">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View className="flex-grow pl-4 flex-row justify-between items-center">
            <Text className="text-text text-3xl">{member?.nickname}</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <FontAwesome6
                name="pen-to-square"
                size={16}
                color={theme.colors.secondary}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default EditUser;
