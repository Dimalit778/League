import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
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
  labelClassName,
  onPress,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  labelClassName?: string;
  onPress?: () => void;
  href?: string;
}) {
  const content = (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className={`text-base ${labelClassName ?? 'text-white'}`}>{label}</Text>
      </View>
      <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
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
      <View
        className="overflow-hidden rounded-2xl border border-[#223554] bg-[#101A2A] px-4"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <MenuItem
          icon={<Bell size={20} color="#97A7BF" />}
          label={t('Notifications')}
          href="/settings"
        />
        <View className="h-px bg-[#223554]" />
        <MenuItem
          icon={<UserPlus size={20} color="#97A7BF" />}
          label={t('Invite friends')}
          onPress={handleInviteFriends}
        />
        <View className="h-px bg-[#223554]" />
        <MenuItem
          icon={<LogOut size={20} color="#f87171" />}
          label={t('Leave league')}
          labelClassName="text-[#f87171]"
          onPress={leavePending ? undefined : onLeave}
        />
      </View>

      {isOwner && onDelete && (
        <Pressable onPress={onDelete} className="mt-4 items-center py-2 active:opacity-70">
          <Text className="text-sm font-semibold text-[#f87171]">{t('Delete League')}</Text>
        </Pressable>
      )}
    </View>
  );
}
