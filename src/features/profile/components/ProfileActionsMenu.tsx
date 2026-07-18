import { Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { hexToRgba } from '@/utils/colorHexToRgba';
import { Link } from 'expo-router';
import { Bell, ChevronRight, LogOut, UserPlus } from 'lucide-react-native';
import { Pressable, Share, View } from 'react-native';

type ProfileActionsMenuProps = {
  leagueName: string;
  joinCode: string;
  competitionArea?: string;
  onLeave: () => void;
  isOwner?: boolean;
  onDelete?: () => void;
  leavePending?: boolean;
};

function MenuItem({
  icon,
  label,
  onPress,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  href?: string;
}) {
  const { colors } = useThemeTokens();
  const content = (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-3">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-border">{icon}</View>
        <Text>{label}</Text>
      </View>
      <ChevronRight size={18} color={colors.muted} />
    </View>
  );

  if (href) {
    return (
      <Link href={href as never} asChild>
        <Pressable className="active:opacity-70">{content}</Pressable>
      </Link>
    );
  }

  return (
    <Pressable onPress={onPress} className="active:opacity-70">
      {content}
    </Pressable>
  );
}

export function ProfileActionsMenu({
  leagueName,
  joinCode,
  competitionArea,
  onLeave,
  isOwner,
  onDelete,
  leavePending,
}: ProfileActionsMenuProps) {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const { colors } = useThemeTokens();
  const handleInviteFriends = async () => {
    try {
      const shareMessage = t(
        'Join my {{area}} league "{{name}}"!\n\nUse code: {{join_code}}\n\nDownload the app to join!',
        {
          area: competitionArea || 'Football',
          name: leagueName,
          join_code: joinCode,
        },
      );

      await Share.share({
        message: shareMessage,
        title: t('Join {{name}} League', { name: leagueName }),
      });
    } catch {
      showAlert({
        title: t('Error'),
        message: t('Failed to share invite code'),
        type: 'error',
        buttons: [{ text: 'OK' }],
      });
    }
  };

  return (
    <View className="mx-3 mt-5">
      <View className="overflow-hidden rounded-2xl border border-border bg-surface px-4">
        <MenuItem icon={<Bell size={18} color={colors.muted} />} label={t('Notifications')} href="/settings" />
        <View className="h-px bg-border" />
        <MenuItem
          icon={<UserPlus size={18} color={colors.muted} />}
          label={t('Invite friends')}
          onPress={handleInviteFriends}
        />
        <View className="h-px bg-border" />
      </View>

      <View className="mt-4 items-center">
        <Pressable
          onPress={leavePending ? undefined : onLeave}
          disabled={leavePending}
          accessibilityRole="button"
          accessibilityLabel={t('Leave league')}
          className="flex-row items-center gap-2.5 rounded-xl border border-error px-5 py-3 active:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: hexToRgba(colors.error, 0.1) }}
        >
          <LogOut size={18} color={colors.error} strokeWidth={2.5} />
          <Text semibold className="text-error">
            {t('Leave league')}
          </Text>
        </Pressable>
      </View>

      {isOwner && onDelete && (
        <Pressable onPress={onDelete} className="mt-4 items-center py-2 active:opacity-70">
          <Text semibold className="text-error">
            {t('Delete League')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
