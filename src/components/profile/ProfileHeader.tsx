import { useUpdateUser } from '@/hooks/useUsers';
import { TablesUpdate } from '@/types/database.types';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type ProfileHeaderProps = {
  fullName?: string;
  email?: string;
};

const ProfileHeader = ({ fullName, email }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>('');
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  const handleSaveChanges = async () => {
    try {
      const updates: TablesUpdate<'users'> = {
        full_name: fullName,
      };

      await updateUser({ updates });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <View className="flex-row p-4 my-2 mx-3 bg-surface rounded-xl border border-border items-center">
      <View className="bg-primary rounded-full w-20 h-20 justify-center items-center">
        <Text className="text-text text-2xl font-bold">
          {(fullName || email || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-grow pl-4">
        {isEditing ? (
          <>
            <TextInput
              className="bg-background text-text p-2 rounded-md border border-border"
              value={name}
              onChangeText={setName}
              placeholder="Enter your nickname"
              placeholderTextColor="#888"
            />
            <View className="flex-row mt-2">
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
            <Text className="text-text text-3xl font-headBold">{fullName}</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="bg-primary rounded-md px-3 py-1"
            >
              <Text className="text-background">Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;
