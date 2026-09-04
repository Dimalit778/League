import { Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { UserPlus } from 'lucide-react-native';
import { Pressable } from 'react-native';

type Props = {
  onInvite: () => void;
  disabled?: boolean;
};

/**
 * Quiet, secondary invite affordance shown under a populated leaderboard — a
 * muted outline pill, deliberately recessive so the gold podium stays the hero.
 * The prominent card ([SparseLeaderboardCard]) is used only when the league is
 * nearly empty and inviting is the primary action.
 */
export function InviteFriendsLink({ onInvite, disabled = false }: Props) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onInvite}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={t('Invite friends')}
      className="mx-4 mb-2 flex-row items-center justify-center gap-2 rounded-full border border-border bg-surface/40 px-4 py-3"
      style={({ pressed }) => ({ opacity: disabled ? 0.5 : pressed ? 0.7 : 1 })}
    >
      <UserPlus size={16} color={colors.muted} strokeWidth={2} />
      <Text variant="label" tone="muted" className="font-semibold">
        {t('Invite friends')}
      </Text>
    </Pressable>
  );
}
