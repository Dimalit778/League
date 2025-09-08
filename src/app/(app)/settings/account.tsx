import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { BackButton } from '@/components/ui';
import { useGetLeagues } from '@/hooks/useLeagues';
import { useGetUser, useUpdateUser } from '@/hooks/useUsers';
import { supabase } from '@/lib/supabase';
import { useMemberStore } from '@/store/MemberStore';
import { TablesUpdate } from '@/types/database.types';
// import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AccountPage() {
  const { member } = useMemberStore();
  const { data: user, isLoading, error, refetch } = useGetUser();
  const { data: leagues, isLoading: leaguesLoading } = useGetLeagues();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  const [nickname, setNickname] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Initialize nickname when user data is loaded
  const onRefresh = useCallback(() => {
    refetch();
    if (user?.full_name) {
      setNickname(user.full_name);
    }
  }, [refetch, user]);

  // Set nickname when user data is loaded
  useState(() => {
    if (user?.full_name) {
      setNickname(user.full_name);
    }
  });

  const handleSaveChanges = async () => {
    try {
      const updates: TablesUpdate<'users'> = {
        full_name: nickname,
      };

      await updateUser({ updates });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const pickImage = async () => {
    // try {
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //     allowsEditing: true,
    //     aspect: [1, 1],
    //     quality: 0.8,
    //   });
    //   if (!result.canceled && result.assets[0].uri) {
    //     await uploadImage(result.assets[0].uri);
    //   }
    // } catch (error) {
    //   console.error('Error picking image:', error);
    //   Alert.alert('Error', 'Failed to pick image');
    // }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate a unique file name
      const fileName = `avatar-${member?.user_id}-${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const updates: TablesUpdate<'users'> = {
        avatar_url: publicURL.publicUrl,
      };

      await updateUser({ updates });
      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (error) return <Error error={error} />;
  if (isLoading) return <LoadingOverlay />;

  return (
    <Screen>
      <BackButton />
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Profile Image and Name */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="items-center mb-4">
            <TouchableOpacity onPress={pickImage} disabled={uploading}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
                  <Text className="text-background text-3xl font-bold">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              {uploading ? (
                <ActivityIndicator
                  size="small"
                  color="#0000ff"
                  className="absolute bottom-0 right-0"
                />
              ) : (
                <View className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                  <Text className="text-background text-xs">Edit</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View className="mb-4">
              <Text className="text-text text-sm mb-1">Nickname</Text>
              <TextInput
                className="bg-background text-text p-2 rounded-md border border-border"
                value={nickname}
                onChangeText={setNickname}
                placeholder="Enter your nickname"
                placeholderTextColor="#888"
              />
              <View className="flex-row justify-end mt-2">
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
            </View>
          ) : (
            <View className="flex-row justify-between items-center mb-2">
              <View>
                <Text className="text-text text-sm">Nickname</Text>
                <Text className="text-text text-lg font-bold">
                  {user?.full_name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="bg-primary rounded-md px-3 py-1"
              >
                <Text className="text-background">Edit</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="mb-2">
            <Text className="text-text text-sm">Email</Text>
            <Text className="text-text">{user?.email || 'Not available'}</Text>
          </View>
        </View>

        {/* User's Leagues */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-text text-lg font-bold">My Leagues</Text>
            <TouchableOpacity
              onPress={() => {
                /* Navigate to leagues page */
              }}
              className="bg-primary rounded-md px-3 py-1"
            >
              <Text className="text-background">View All</Text>
            </TouchableOpacity>
          </View>

          {leaguesLoading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : leagues && leagues.length > 0 ? (
            leagues.map((league) => (
              <View
                key={league.id}
                className="border-b border-border py-3 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-text font-bold">{league.name}</Text>
                  <Text className="text-muted text-xs">
                    {league.is_primary ? 'Primary League' : 'Member'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    /* Navigate to league details */
                  }}
                  className="bg-surface border border-border rounded-md px-3 py-1"
                >
                  <Text className="text-text">Details</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-muted italic">No leagues joined yet</Text>
          )}
        </View>

        {/* Account Settings */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-text text-lg font-bold mb-4">
            Account Settings
          </Text>

          <TouchableOpacity
            className="border-b border-border py-3"
            onPress={() => {
              /* Navigate to change password */
            }}
          >
            <Text className="text-text">Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border-b border-border py-3"
            onPress={() => {
              /* Navigate to notification settings */
            }}
          >
            <Text className="text-text">Notification Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3"
            onPress={() => {
              /* Sign out */
            }}
          >
            <Text className="text-error">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}
