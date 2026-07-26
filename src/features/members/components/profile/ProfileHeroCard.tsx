import { LoadingOverlay } from '@/components/layout';
import { AvatarImage, Text } from '@/components/ui';
import { HeaderBackground } from '@/components/ui/HeaderBackground';
import { useGetMember } from '@/features/members/hooks/useMembers';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { useLeagueId, useMemberId } from '@/store/PrimaryLeagueStore';
import { formatNameCapitalize } from '@/utils/formats';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';
import { BarChart3, Camera, CalendarDays, Settings, Shield, Star, Trophy } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useDeleteMemberImage, useUploadMemberImage } from '../../hooks/useMembers';

function HeroStat({
  icon,
  label,
  value,
  accent,
  showDivider = true,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  showDivider?: boolean;
}) {
  return (
    <>
      <View className="flex-1 items-center px-1">
        {icon}
        <Text className="mt-1 text-[9px] uppercase tracking-wide text-muted" numberOfLines={1}>
          {label}
        </Text>
        <Text className={`mt-0.5 text-sm font-bold ${accent ? 'text-success' : 'text-text'}`} numberOfLines={1}>
          {value}
        </Text>
      </View>
      {showDivider ? <View className="w-px self-stretch bg-border opacity-70" /> : null}
    </>
  );
}

type ProfileHeroCardProps = {
  rank?: number;
  points?: number;
};

export function ProfileHeroCard({ rank, points }: ProfileHeroCardProps) {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const memberId = useMemberId();
  const leagueId = useLeagueId();
  const { data: member } = useGetMember(memberId);
  const nickname = member?.nickname ?? '';
  const avatarUrl = member?.avatar_url ?? null;
  const leagueName = member?.league?.name ?? '';
  const isPrimary = member?.is_primary ?? false;
  const joinedLabel = member?.created_at
    ? new Date(member.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
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

  const displayName = formatNameCapitalize(nickname);

  return (
    <HeaderBackground>
      <View className="p-4">
        {(deleteImage.isPending || uploadImage.isPending) && <LoadingOverlay />}

        <Link href="/(app)/(league)/edit" asChild>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('Manage League')}
            className="absolute top-2 end-2 z-10 h-9 w-9 items-center justify-center rounded-full bg-surfaceSecondary"
            hitSlop={6}
          >
            <Settings size={18} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </Link>

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

        {/* Identity stat strip */}
        <View className="mt-4 flex-row items-stretch border-t border-border pt-3">
          <HeroStat
            icon={<BarChart3 size={15} color={colors.primary} />}
            label={t('Rank')}
            value={rank ? `#${rank}` : '—'}
          />
          <HeroStat
            icon={<Star size={15} color={colors.primary} fill={colors.primary} />}
            label={t('Points')}
            value={points != null ? `${points}` : '—'}
          />
          <HeroStat
            icon={<CalendarDays size={15} color={colors.primary} />}
            label={t('Joined')}
            value={joinedLabel}
          />
          <HeroStat
            icon={<Trophy size={15} color={colors.primary} />}
            label={t('League')}
            value={isPrimary ? t('Primary') : leagueName || '—'}
            accent={isPrimary}
            showDivider={false}
          />
        </View>
      </View>
    </HeaderBackground>
  );
}
