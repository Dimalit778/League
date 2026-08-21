import { Button, HeaderBackground, Row, Text } from '@/components';
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
    <HeaderBackground>
      <View className="gap-4 p-4">
        <Row className="gap-4">
          <View
            className="h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${colors.primary}1F` }}
          >
            <UsersRound size={30} color={colors.primary} strokeWidth={1.8} />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text variant="subtitle" numberOfLines={1} className="font-bold text-white">
              {t('More friends, more competition')}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {t('Invite friends to your league and make every match more exciting.')}
            </Text>
          </View>
        </Row>

        <Button
          label={t('Invite friends')}
          onPress={onInvite}
          disabled={disabled}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </HeaderBackground>
  );
}
