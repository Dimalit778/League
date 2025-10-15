import LoadingOverlay from '@/components/layout/LoadingOverlay';
import BackButton from '@/components/ui/BackButton';
import ProfileImage from '@/components/ui/ProfileImage';
import { useCurrentSession } from '@/hooks/useCurrentSession';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useGetUser, useUpdateUser } from '@/hooks/useUsers';
import { supabase } from '@/lib/supabase';
import { LockIcon, UserIcon } from '@assets/icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { decode } from 'base64-arraybuffer';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfile() {
  const theme = useThemeTokens();
  const { session } = useCurrentSession();
  const { data: user, isLoading: isLoadingUser } = useGetUser();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();

  // Form state
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      // Note: avatar_url is not in the main users table, we'll manage it separately
      setAvatarUrl(null);
    }
  }, [user]);

  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Permission to access photo library is required!'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string) => {
    if (!session?.user?.id) return;

    setIsUploadingImage(true);
    try {
      // Resize and compress image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Convert to base64
      const response = await fetch(manipulatedImage.uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      // Generate unique filename
      const fileExt = 'jpg';
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, decode(base64String), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(filePath);

      // Note: Since avatar_url is not in the main users table schema,
      // we'll just update the local state for now
      // In a real app, you might want to add avatar_url to the users table
      // or handle it through a separate profile table

      setAvatarUrl(publicUrl);
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    try {
      await updateUser({
        updates: { full_name: fullName.trim() },
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session?.user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert('Success', 'Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  // const handleSelectImage = useCallback(async () => {
  //   if (!leagueId || !memberId) return;

  //   const options: ImagePicker.ImagePickerOptions = {
  //     mediaTypes: ['images'],
  //     allowsEditing: true,
  //     quality: 1,
  //     aspect: [1, 1],
  //   };

  //   const result = await ImagePicker.launchImageLibraryAsync(options);
  //   if (result.canceled) return;

  //   const [asset] = result.assets;
  //   if (!asset) return;

  //   try {
  //     const updatedMember = (await uploadImage.mutateAsync(asset)) as
  //       | MemberLeague
  //       | undefined;
  //     if (updatedMember) {
  //       setMember(updatedMember);
  //     }
  //     Alert.alert('Success', 'Profile image updated successfully');
  //   } catch (error) {
  //     console.error('Failed to update profile image:', error);
  //     Alert.alert(
  //       'Error',
  //       error instanceof Error
  //         ? error.message
  //         : 'Failed to update profile image'
  //     );
  //   }
  // }, [leagueId, memberId, uploadImage, setMember]);

  // const confirmRemoveImage = useCallback(() => {
  //   if (!member?.avatar_url || !leagueId || !memberId) return;

  //   Alert.alert('Remove Image', 'Remove your profile image?', [
  //     { text: 'Cancel', style: 'cancel' },
  //     {
  //       text: 'Remove',
  //       style: 'destructive',
  //       onPress: async () => {
  //         try {
  //           const updatedMember = (await deleteImage.mutateAsync(
  //             member.avatar_url
  //           )) as MemberLeague | undefined;
  //           if (updatedMember) {
  //             setMember(updatedMember);
  //           }
  //           Alert.alert('Removed', 'Profile image removed');
  //         } catch (error) {
  //           console.error('Failed to remove profile image:', error);
  //           Alert.alert(
  //             'Error',
  //             error instanceof Error
  //               ? error.message
  //               : 'Failed to remove profile image'
  //           );
  //         }
  //       },
  //     },
  //   ]);
  // }, [deleteImage, leagueId, member?.avatar_url, memberId, setMember]);

  if (isLoadingUser) return <LoadingOverlay />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-6 space-y-8">
            {/* Profile Picture Section */}
            <View className="items-center space-y-4">
              <View className="relative">
                <ProfileImage
                  imageUrl={avatarUrl}
                  nickname={user?.full_name}
                  size="xl"
                />
                <TouchableOpacity
                  onPress={handleImagePicker}
                  disabled={isUploadingImage}
                  className="absolute -bottom-2 -right-2 bg-primary rounded-full p-3 border-2 border-background"
                >
                  {isUploadingImage ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <FontAwesome6 name="camera" size={16} color="white" />
                  )}
                </TouchableOpacity>
              </View>
              <Text className="text-text-secondary text-sm text-center">
                Tap the camera icon to change your profile picture
              </Text>
            </View>

            {/* Profile Information Section */}
            <View className="space-y-6">
              <View className="flex-row items-center space-x-3 mb-4">
                <UserIcon color={theme.colors.primary} />
                <Text className="text-text text-lg font-semibold">
                  Profile Information
                </Text>
              </View>

              {/* Full Name */}
              <View className="space-y-2">
                <Text className="text-text font-medium">Full Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.muted}
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-text"
                />
              </View>

              {/* Email (Read-only) */}
              <View className="space-y-2">
                <Text className="text-text font-medium">Email</Text>
                <View className="bg-surface border border-border rounded-lg px-4 py-3 opacity-60">
                  <Text className="text-text">{session?.user?.email}</Text>
                </View>
                <Text className="text-text-secondary text-xs">
                  Email cannot be changed from this screen
                </Text>
              </View>

              {/* Update Profile Button */}
              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={isUpdatingUser}
                className="bg-primary rounded-lg py-3 items-center"
              >
                {isUpdatingUser ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold">
                    Update Profile
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Password Section */}
            <View className="space-y-6">
              <View className="flex-row items-center space-x-3 mb-4">
                <LockIcon color={theme.colors.primary} />
                <Text className="text-text text-lg font-semibold">
                  Change Password
                </Text>
              </View>

              {/* Current Password */}
              <View className="space-y-2">
                <Text className="text-text font-medium">Current Password</Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={theme.colors.muted}
                  secureTextEntry
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-text"
                />
              </View>

              {/* New Password */}
              <View className="space-y-2">
                <Text className="text-text font-medium">New Password</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={theme.colors.muted}
                  secureTextEntry
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-text"
                />
              </View>

              {/* Confirm New Password */}
              <View className="space-y-2">
                <Text className="text-text font-medium">
                  Confirm New Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor={theme.colors.muted}
                  secureTextEntry
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-text"
                />
              </View>

              {/* Update Password Button */}
              <TouchableOpacity
                onPress={handleUpdatePassword}
                disabled={isUpdatingPassword}
                className="bg-secondary rounded-lg py-3 items-center"
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold">
                    Update Password
                  </Text>
                )}
              </TouchableOpacity>

              <Text className="text-text-secondary text-xs text-center">
                Password must be at least 6 characters long
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
