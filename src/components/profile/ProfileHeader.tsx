import { useUpdateUser } from '@/hooks/useUsers';
import { supabase } from '@/lib/supabase';
import { useMemberStore } from '@/store/MemberStore';
import { TablesUpdate } from '@/types/database.types';
import { FontAwesome } from '@expo/vector-icons';
import { FileObject } from '@supabase/storage-js';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProfileImage } from '../ui';
type ProfileHeaderProps = {
  fullName?: string;
  email?: string;
};

const ProfileHeader = ({ fullName, email }: ProfileHeaderProps) => {
  const [fileName, setFileName] = useState<FileObject[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>('');
  const { member, setMember } = useMemberStore();
  const displayInitial = useMemo(
    () => (fullName || email || 'U').charAt(0).toUpperCase(),
    [fullName, email]
  );

  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const pickAndUploadAvatar = async () => {
    try {
      setIsUploading(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      // Resolve current user id for pathing
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id || member?.user_id;
      if (!userId) {
        Alert.alert('Error', 'No authenticated user.');
        return;
      }
      // Prepare file
      const uri = asset.uri;
      const fileExt = (
        asset.fileName?.split('.').pop() ||
        asset.mimeType?.split('/').pop() ||
        'jpg'
      ).toLowerCase();
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const contentType = asset.mimeType || 'image/jpeg';
      // Upload to Supabase Storage - assumes an 'avatars' bucket exists
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { contentType, upsert: true });
      if (uploadError) throw uploadError;
      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);
      // Persist to current primary league member, if available
      if (member?.id) {
        const { data, error } = await supabase
          .from('league_members')
          .update({ avatar_url: publicUrl })
          .eq('id', member.id)
          .select()
          .single();
        if (error) throw error;
        // Update local store for immediate UI refresh
        setMember({ ...(member as any), avatar_url: data.avatar_url });
      }
      Alert.alert('Success', 'Avatar updated');
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      Alert.alert('Error', err?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };
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
      <View className="relative">
        <ProfileImage
          imageUrl={member?.avatar_url || ''}
          nickname={member?.nickname || ''}
          size="xl"
        />
        <TouchableOpacity
          onPress={pickAndUploadAvatar}
          disabled={isUploading}
          className="absolute -right-1 -bottom-1 bg-primary rounded-full w-8 h-8 items-center justify-center border border-border"
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <FontAwesome name="plus" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
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
