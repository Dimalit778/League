import { AvatarImage, Button } from '@/components';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Check, ImagePlus, Trash2, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useDeleteMemberImage, useUploadMemberImage } from '../../hooks/useMembers';

export function ProfileHeroCard() {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const memberId = useMemberId();
  const { data: member } = useGetMember(memberId);
  const nickname = member?.nickname ?? '';
  const avatarUrl = member?.avatar_url ?? null;
  const { colors } = useThemeTokens();
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
      // iOS 15.4+ and modern Android use the system photo picker, which lets
      // the user choose a single image without granting broad library access.
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
    } catch {
      showAlert({
        title: t('Error'),
        message: t('Failed to pick image'),
        type: 'warning',
        buttons: [{ text: t('OK') }],
      });
    }
  };

  const handleCancelPreview = () => {
    setPreviewImage(null);
    setPickedAsset(null);
  };

  const handleSavePreview = async () => {
    if (!pickedAsset || !memberId) return;
    previousImageRef.current = image;

    try {
      const data = await uploadImage.mutateAsync({ memberId, avatarUrl: pickedAsset });
      setImage(data?.avatar_url ?? null);
      setPreviewImage(null);
      setPickedAsset(null);
    } catch {
      showAlert({
        title: t('Error'),
        message: t('Failed to upload image'),
        type: 'warning',
        buttons: [{ text: t('OK') }],
      });
      setImage(previousImageRef.current);
    }
  };

  const handleDeleteImage = () => {
    if (!memberId || !image) return;

    showAlert({
      title: t('Delete Profile Picture'),
      message: t('Are you sure you want to delete your profile picture?'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => {
            void deleteImage
              .mutateAsync({ memberId, currentPath: image })
              .then(() => setImage(null))
              .catch(() => {
                showAlert({
                  title: t('Error'),
                  message: t('Failed to delete image'),
                  type: 'warning',
                  buttons: [{ text: t('OK') }],
                });
              });
          },
        },
      ],
    });
  };

  return (
    <View className="items-center py-2">
      <View className="relative mb-3">
        <View className="h-40 w-40 overflow-hidden rounded-full">
          {previewImage ? (
            <ExpoImage
              source={{ uri: previewImage }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              cachePolicy="none"
            />
          ) : (
            <AvatarImage nickname={nickname} path={image} loading={deleteImage.isPending || uploadImage.isPending} />
          )}
        </View>

        {previewImage ? (
          <>
            <Button
              accessibilityLabel={t('Cancel')}
              variant="outline"
              size="icon"
              className="absolute -bottom-2 -left-2 rounded-full bg-surface"
              onPress={handleCancelPreview}
              disabled={uploadImage.isPending}
            >
              <X size={19} color={colors.text} />
            </Button>
            <Button
              accessibilityLabel={t('Save')}
              size="icon"
              className="absolute -bottom-2 -right-2 rounded-full"
              onPress={handleSavePreview}
              loading={uploadImage.isPending}
            >
              <Check size={19} color={colors.onPrimary} />
            </Button>
          </>
        ) : (
          <>
            <Button
              accessibilityLabel={t('Choose Image')}
              size="icon"
              className="absolute -bottom-2 -left-2 rounded-full"
              onPress={handleImagePicker}
              disabled={deleteImage.isPending}
            >
              <ImagePlus size={18} color={colors.onPrimary} />
            </Button>
            {image ? (
              <Button
                accessibilityLabel={t('Delete')}
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 rounded-full bg-surface"
                onPress={handleDeleteImage}
                loading={deleteImage.isPending}
              >
                <Trash2 size={18} color={colors.error} />
              </Button>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}
