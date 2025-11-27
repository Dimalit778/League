import { LoadingOverlay } from '@/components/layout';
import { AvatarImage } from '@/components/ui';
import { useMemberStore } from '@/store/MemberStore';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { useDeleteMemberImage, useUploadMemberImage } from '../../hooks/useMembers';

type AvatarSectionProps = {
  nickname: string | null;
  avatarUrl: string | null;
};

export const AvatarSection = ({ nickname, avatarUrl }: AvatarSectionProps) => {
  const { memberId, leagueId } = useMemberStore();
  const [image, setImage] = useState<string | null>(avatarUrl);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pickedAsset, setPickedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const uploadImage = useUploadMemberImage();
  const deleteImage = useDeleteMemberImage();

  const previousImageRef = useRef<string | null>(avatarUrl);

  useEffect(() => {
    setImage(avatarUrl);
    previousImageRef.current = avatarUrl;
  }, [avatarUrl]);

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'We need access to your photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      // Handle result
      if (!result.canceled && result.assets[0]?.uri) {
        setPreviewImage(result.assets[0].uri);
        setPickedAsset(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCancelPreview = () => {
    setPreviewImage(null);
    setPickedAsset(null);
  };

  const handleSavePreview = async () => {
    if (!pickedAsset || !memberId || !leagueId) return;
    previousImageRef.current = image;

    try {
      const data = await uploadImage.mutateAsync({ memberId, avatarUrl: pickedAsset });
      setImage(data?.avatar_url ?? null);
      setPreviewImage(null);
      setPickedAsset(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
      setImage(previousImageRef.current);
    }
  };

  const handleDeleteImage = async () => {
    if (!memberId || !image) return;

    Alert.alert('Delete Profile Picture', 'Are you sure you want to delete your profile picture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          previousImageRef.current = image;
          setImage(null);
          try {
            await deleteImage.mutateAsync({ memberId, currentPath: image });
          } catch (error) {
            console.error('Error deleting image:', error);
            Alert.alert('Error', 'Failed to delete image');

            setImage(previousImageRef.current);
          }
        },
      },
    ]);
  };

  return (
    <View className="items-center px-4">
      <View className="relative mb-4">
        {deleteImage.isPending || (uploadImage.isPending && <LoadingOverlay />)}
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
            <AvatarImage nickname={nickname} path={image} className="w-40 h-40 rounded-full" />
          )}
        </View>

        {previewImage ? (
          <>
            <TouchableOpacity
              onPress={handleCancelPreview}
              disabled={uploadImage.isPending}
              className="absolute -bottom-2 -left-2 bg-red-500 rounded-full p-3 border-2 border-background"
              accessibilityLabel="Cancel image selection"
              accessibilityRole="button"
            >
              <FontAwesome6 name="xmark" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSavePreview}
              disabled={uploadImage.isPending}
              className="absolute -bottom-2 -right-2 bg-primary rounded-full p-3 border-2 border-background"
              accessibilityLabel="Save profile picture"
              accessibilityRole="button"
            >
              <FontAwesome6 name="check" size={16} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={handleImagePicker}
              disabled={uploadImage.isPending || deleteImage.isPending}
              className="absolute -bottom-2 -right-2 bg-primary rounded-full p-3 border-2 border-background"
              accessibilityLabel="Change profile picture"
              accessibilityRole="button"
            >
              <FontAwesome6 name="camera" size={16} color="white" />
            </TouchableOpacity>

            {image && (
              <TouchableOpacity
                onPress={handleDeleteImage}
                disabled={deleteImage.isPending || uploadImage.isPending}
                className="absolute -bottom-2 -left-2 bg-red-500 rounded-full p-3 border-2 border-background"
                accessibilityLabel="Delete profile picture"
                accessibilityRole="button"
              >
                <FontAwesome6 name="trash" size={16} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};
