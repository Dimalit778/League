import { Button, Card, Row, Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { UsersRound } from 'lucide-react-native';
import { View } from 'react-native';

type Props = {
  onInvite: () => void;
  disabled?: boolean;
};

export function InviteFriendsCard({ onInvite, disabled = false }: Props) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <Card padding="md" variant="soft" contentClassName="gap-4">
      <Row className="gap-4">
        <View
          className="h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${colors.primary}1F` }}
        >
          <UsersRound size={30} color={colors.primary} strokeWidth={1.8} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="title" size="lg" numberOfLines={1} className="font-bold text-white">
            {t('More friends, more competition')}
          </Text>
          <Text variant="label" tone="muted">
            {t('Invite friends to your league and make every match more exciting.')}
          </Text>
        </View>
      </Row>

      <Button
        label={t('Invite friends')}
        onPress={onInvite}
        disabled={disabled}
        variant="primary"
        size="md"
        fullWidth
      />
    </Card>
  );
}
