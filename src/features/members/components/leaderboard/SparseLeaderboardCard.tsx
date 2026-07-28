import { Button, Text } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { UsersRound } from 'lucide-react-native';
import { View } from 'react-native';

type SparseLeaderboardCardProps = {
  memberCount: number;
  onInvite: () => void;
  inviteDisabled?: boolean;
};

export function SparseLeaderboardCard({
  memberCount,
  onInvite,
  inviteDisabled = false,
}: SparseLeaderboardCardProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="flex-1 justify-center px-4 pb-4">
      <View className="items-center rounded-xl border border-border bg-surface px-5 py-4">
        <View
          className="mb-2 h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.primary}17` }}
        >
          <UsersRound size={22} color={colors.primary} strokeWidth={1.8} />
        </View>

        <Text className="font-semibold text-center">
          {t("That's the whole leaderboard for now")}
        </Text>

        <Text className="text-xs mt-1 max-w-72 text-center text-muted">
          {t('Invite more friends and make the league more competitive.')}
        </Text>

        <Button
          title={t('Invite friends')}
          onPress={onInvite}
          disabled={inviteDisabled}
          variant="outline"
          size="sm"
          className="mt-3 px-5"
        />

        <Text className="text-xs mt-2 text-center text-muted">
          {t('{{count}} league members', { count: memberCount })}
        </Text>
      </View>
    </View>
  );
}
