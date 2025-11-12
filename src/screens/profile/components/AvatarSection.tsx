import { AvatarImage } from '@/components/ui';
import { useDeleteMemberImage, useUploadMemberImage } from '@/hooks/useMembers';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native';

type AvatarSectionProps = {
  nickname: string | null;
  avatarUrl: string | null;
};

export const AvatarSection = ({ nickname, avatarUrl }: AvatarSectionProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pickedAsset, setPickedAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const uploadImage = useUploadMemberImage();
  const deleteImage = useDeleteMemberImage();

  const handleImagePicker = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'We need access to your photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPreviewImage(result.assets[0].uri);
        setPickedAsset(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCancelPreview = useCallback(() => {
    setPreviewImage(null);
    setPickedAsset(null);
  }, []);

  const handleSavePreview = useCallback(async () => {
    if (!pickedAsset) return;
    try {
      await uploadImage.mutateAsync(pickedAsset);
      // await initializeMemberLeagues();
      setPreviewImage(null);
      setPickedAsset(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  }, [uploadImage, pickedAsset]);

  const handleDeleteImage = useCallback(() => {
    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteImage.mutate(avatarUrl ?? null, {
              onSuccess: () => {
                // initializeMemberLeagues();
              },
              onError: () => {
                Alert.alert('Error', 'Failed to delete image');
              },
            });
          },
        },
      ]
    );
  }, []);

  return (
    <View className="px-4 mt-4">
      <View className="items-center px-4">
        <View className="relative mb-4">
          <View className="w-40 h-40 rounded-full overflow-hidden bg-surface">
            {previewImage ? (
              <ExpoImage
                source={{ uri: previewImage }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="none"
                priority="high"
                transition={0}
              />
            ) : (
              <AvatarImage
                nickname={nickname}
                path={avatarUrl}
                className="w-40 h-40 rounded-full"
              />
            )}
          </View>

          {previewImage ? (
            <>
              <TouchableOpacity
                onPress={handleCancelPreview}
                disabled={uploadImage.isPending}
                className="absolute -bottom-2 -left-2 bg-red-500 rounded-full p-3 border-2 border-background"
              >
                <FontAwesome6 name="xmark" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSavePreview}
                disabled={uploadImage.isPending}
                className="absolute -bottom-2 -right-2 bg-primary rounded-full p-3 border-2 border-background"
              >
                <FontAwesome6 name="plus" size={16} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleImagePicker}
                disabled={uploadImage.isPending}
                className="absolute -bottom-2 -right-2 bg-primary rounded-full p-3 border-2 border-background"
              >
                <FontAwesome6 name="camera" size={16} color="white" />
              </TouchableOpacity>

              {avatarUrl && (
                <TouchableOpacity
                  onPress={handleDeleteImage}
                  disabled={deleteImage.isPending}
                  className="absolute -bottom-2 -left-2 bg-red-500 rounded-full p-3 border-2 border-background"
                >
                  {deleteImage.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <FontAwesome6 name="trash" size={16} color="white" />
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};
