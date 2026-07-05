import { LoadingOverlay } from '@/components/layout';
import { AvatarImage, CText, HeaderSection } from '@/components/ui';
import { MemberStatsType } from '@/features/members/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { usePrimaryMember } from '@/store/MemberStore';
import { formatNameCapitalize } from '@/utils/formats';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3, Calendar, Shield, Star, Trophy } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useDeleteMemberImage, useUploadMemberImage } from '../../hooks/useMembers';
const GOLD = '#E3B421';
const GOLD_LIGHT = '#D5B13F';

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
  return (
    <View className="flex-1 items-center">
      <View className="mb-1">{icon}</View>
      <CText className="text-[10px] uppercase tracking-wide text-[#97A7BF]">{label}</CText>
      <CText className={`mt-0.5 text-sm font-bold ${valueClassName ?? 'text-white'}`} numberOfLines={1}>
        {value}
      </CText>
    </View>
  );
}

export function ProfileHeroCard({ nickname, avatarUrl, leagueName, isPrimary, joinedAt, stats }: ProfileHeroCardProps) {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const { memberId, leagueId } = usePrimaryMember();

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
            <View
              className="h-24 w-24 items-center justify-center rounded-full border-2 border-[#D5B13F]"
              style={{
                shadowColor: GOLD,
                shadowOpacity: 0.4,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
              }}
            >
              <LinearGradient
                colors={['rgba(227,180,33,0.15)', 'rgba(227,180,33,0.02)']}
                style={{ position: 'absolute', inset: 0, borderRadius: 999 }}
              />
              <View className="h-[88px] w-[88px] overflow-hidden rounded-full bg-[#091425]">
                {previewImage ? (
                  <ExpoImage
                    source={{ uri: previewImage }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    cachePolicy="none"
                  />
                ) : (
                  <AvatarImage
                    nickname={nickname}
                    path={image}
                    className="h-[88px] w-[88px] rounded-full border-0 bg-[#091425]"
                  />
                )}
              </View>
            </View>

            {/* Hex badge */}
            <View className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-md bg-[#1A2740] border border-[#D5B13F]">
              <Star size={14} color={GOLD} fill={GOLD} />
            </View>

            {/* Camera / save / cancel controls */}
            {previewImage ? (
              <>
                <TouchableOpacity
                  onPress={handleCancelPreview}
                  disabled={uploadImage.isPending}
                  className="absolute -bottom-1 -left-1 rounded-full border-2 border-[#081325] bg-red-500 p-2"
                  accessibilityLabel={t('Cancel image selection')}
                >
                  <FontAwesome6 name="xmark" size={12} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSavePreview}
                  disabled={uploadImage.isPending}
                  className="absolute -top-1 -right-1 rounded-full border-2 border-[#081325] bg-[#D5B13F] p-2"
                  accessibilityLabel={t('Save profile picture')}
                >
                  <FontAwesome6 name="check" size={12} color="#081325" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={handleImagePicker}
                disabled={uploadImage.isPending || deleteImage.isPending}
                className="absolute -top-1 -right-1 rounded-full border-2 border-[#081325] bg-[#D5B13F] p-2"
                accessibilityLabel={t('Change profile picture')}
              >
                <FontAwesome6 name="camera" size={12} color="#081325" />
              </TouchableOpacity>
            )}
          </View>

          {/* User info */}
          <View className="min-w-0 flex-1">
            <CText className="text-xl font-black text-white" numberOfLines={1}>
              {displayName}
            </CText>
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <Shield size={13} color={GOLD_LIGHT} />
              <CText className="text-sm text-[#97A7BF]">{t('Member of {{name}}', { name: leagueName })}</CText>
            </View>
            {isPrimary && (
              <View className="mt-1 flex-row items-center gap-1.5">
                <Star size={13} color="#4ade80" fill="#4ade80" />
                <CText className="text-sm font-semibold text-[#4ade80]">{t('Primary league')}</CText>
              </View>
            )}
          </View>
        </View>

        {/* Stats row */}
        <View className="mt-5 flex-row rounded-2xl border border-[#223554] bg-[#091425]/60 px-2 py-3">
          <StatItem icon={<BarChart3 size={16} color={GOLD} />} label={t('Rank')} value={rank} />
          <View className="mx-1 w-px self-stretch bg-[#223554]" />
          <StatItem icon={<Star size={16} color={GOLD} fill={GOLD} />} label={t('Points')} value={points} />
          <View className="mx-1 w-px self-stretch bg-[#223554]" />
          <StatItem icon={<Calendar size={16} color={GOLD} />} label={t('Joined')} value={joinedFormatted} />
          <View className="mx-1 w-px self-stretch bg-[#223554]" />
          <StatItem
            icon={<Trophy size={16} color={GOLD} />}
            label={t('League')}
            value={isPrimary ? t('Primary') : leagueName}
            valueClassName={isPrimary ? 'text-[#4ade80]' : 'text-white'}
          />
        </View>
      </View>
    </HeaderSection>
  );
}
