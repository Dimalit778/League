import { LoadingOverlay } from '@/components/layout';
import { AvatarImage, Text } from '@/components/ui';
import { HeaderSection } from '@/components/ui/HeaderSection';
import { MemberStatsType } from '@/features/memberStats/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { useMyMember } from '@/store/MemberStore';
import { formatNameCapitalize } from '@/utils/formats';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { BarChart3, Calendar, Camera, Shield, Star, Trophy } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useDeleteMemberImage, useUploadMemberImage } from '../hooks/useMembers';

type ProfileHeroCardProps = {
  nickname: string;
  avatarUrl: string | null;
  leagueName: string;
  isPrimary: boolean;
  joinedAt: string;
  stats?: MemberStatsType;
};

function StatItem({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  const { colors } = useThemeTokens();
  return (
    <View className="flex-1 items-center">
      <View className="mb-1">{icon}</View>
      <Text small semibold>
        {label}
      </Text>
      <Text caption semibold className={`mt-0.5 ${valueClassName ?? colors.text}`} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function ProfileHeroCard() {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const { member } = useMyMember();
  const { colors } = useThemeTokens();
  const [image, setImage] = useState<string | null>(member?.avatar_url ?? null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pickedAsset, setPickedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const uploadImage = useUploadMemberImage();
  const deleteImage = useDeleteMemberImage();

  const previousImageRef = useRef<string | null>(member?.avatar_url ?? null);

  useEffect(() => {
    setImage(member?.avatar_url ?? null);
    previousImageRef.current = member?.avatar_url ?? null;
  }, [member?.avatar_url]);

  const handleImagePicker = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert({
          title: t('Permission required'),
          message: t('We need access to your photos.'),
          type: 'warning',
          buttons: [{ text: 'OK' }],
        });
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
    } catch {
      showAlert({
        title: t('Error'),
        message: t('Failed to pick image'),
        type: 'error',
        buttons: [{ text: 'OK' }],
      });
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
    } catch {
      showAlert({
        title: t('Error'),
        message: t('Failed to upload image'),
        type: 'error',
        buttons: [{ text: 'OK' }],
      });
      setImage(previousImageRef.current);
    }
  };

  const joinedFormatted = new Date(joinedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const displayName = formatNameCapitalize(nickname);
  const rank = stats?.position ? `#${stats.position}` : '—';
  const points = stats?.totalPoints != null ? `${stats.totalPoints} pts` : '—';

  return (
    <HeaderSection>
      <View className="p-4">
        {(deleteImage.isPending || uploadImage.isPending) && <LoadingOverlay />}

        <View className="flex-row items-center gap-4">
          {/* Avatar with gold ring */}
          <View className="relative">
            <View className="h-24 w-24 items-center justify-center rounded-full border-2 bg-surfaceSecondary border-primary">
              <View className="h-[88px] w-[88px] overflow-hidden rounded-full bg-[#091425]">
                {previewImage ? (
                  <ExpoImage
                    source={{ uri: previewImage }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    cachePolicy="none"
                  />
                ) : (
                  <AvatarImage nickname={nickname} path={image} />
                )}
              </View>
            </View>

            {/* Camera / save / cancel controls */}
            {previewImage ? (
              <>
                <TouchableOpacity
                  onPress={handleCancelPreview}
                  disabled={uploadImage.isPending}
                  className="absolute -bottom-1 -left-1 rounded-full border-2 border-border bg-surfaceSecondary p-2"
                  accessibilityLabel={t('Cancel image selection')}
                >
                  <FontAwesome6 name="xmark" size={12} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSavePreview}
                  disabled={uploadImage.isPending}
                  className="absolute -top-1 -right-1 rounded-full border-2 border-border bg-surfaceSecondary p-2"
                  accessibilityLabel={t('Save profile picture')}
                >
                  <FontAwesome6 name="check" size={12} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={handleImagePicker}
                disabled={uploadImage.isPending || deleteImage.isPending}
                className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full bg-surfaceSecondary border border-primary "
                accessibilityLabel={t('Change profile picture')}
              >
                <Camera size={18} color={colors.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>

          {/* User info */}
          <View className="min-w-0 flex-1">
            <Text h2 semibold numberOfLines={1}>
              {displayName}
            </Text>
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <Shield size={13} color={colors.primary} strokeWidth={2.5} />
              <Text className="text-sm text-muted">{t('Member of {{name}}', { name: leagueName })}</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View className="mt-5 flex-row rounded-2xl border border-border bg-surfaceSecondary px-2 py-3">
          <StatItem
            icon={<BarChart3 size={16} color={colors.primary} strokeWidth={2.5} />}
            label={t('Rank')}
            value={rank}
          />
          <View className="mx-1 w-px self-stretch bg-border" />
          <StatItem
            icon={<Star size={16} color={colors.primary} fill={colors.primary} strokeWidth={2.5} />}
            label={t('Points')}
            value={points}
          />
          <View className="mx-1 w-px self-stretch bg-border" />
          <StatItem
            icon={<Calendar size={16} color={colors.primary} strokeWidth={2.5} />}
            label={t('Joined')}
            value={joinedFormatted}
          />
          <View className="mx-1 w-px self-stretch bg-border" />
          <StatItem
            icon={<Trophy size={16} color={colors.primary} strokeWidth={2.5} />}
            label={t('League')}
            value={isPrimary ? t('Primary') : leagueName}
            valueClassName={isPrimary ? 'text-primary' : colors.text}
          />
        </View>
      </View>
    </HeaderSection>
  );
}
