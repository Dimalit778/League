import { Button, Card, Screen, Text } from '@/components';
import { useIsAdmin } from '@/features/admin/hooks/useAdmin';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import SettingsContent from '@/features/settings/components/Settings/SettingsContent';
import { useDeleteUser } from '@/features/settings/hooks/useUsers';
import { useTranslation } from '@/hooks/useTranslation';
import { openStoreSubscriptionManagement } from '@/lib/revenuecat/purchases';
import { useAlert } from '@/providers/AlertProvider';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';

const SettingsScreen = () => {
  const { data: isAdmin } = useIsAdmin();
  const deleteUserMutation = useDeleteUser();
  const { signOut } = useAuthActions();
  const { t } = useTranslation();
  const { showAlert } = useAlert();

  const confirmDeleteAccount = () => {
    showAlert({
      title: t('Delete Account'),
      message: t('Delete account confirmation message'),
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Delete'), style: 'destructive', onPress: () => deleteUserMutation.mutate() },
      ],
    });
  };

  const handleDeleteAccountPress = () => {
    showAlert({
      title: t('Check your subscription first'),
      message: t('Deleting your Champo account does not cancel an active App Store subscription.'),
      type: 'warning',
      buttons: [
        {
          text: t('Manage Subscription'),
          onPress: () => void openStoreSubscriptionManagement(),
        },
        { text: t('Continue deletion'), style: 'destructive', onPress: confirmDeleteAccount },
      ],
    });
  };

  const handleSignOut = async () => {
    const result = await signOut();

    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert(t('Error'), result.error || t('Failed to sign out'));
    }
  };

  return (
    <Screen scroll padding="horizontal" bottomInset>
      <View className="mt-2">
        <SettingsContent />
      </View>

      {isAdmin && (
        <View className="mt-8 px-6">
          <Button
            label={t('Open Admin Dashboard')}
            onPress={() => router.push('/(app)/(admin)/competitions')}
            variant="outline"
          />
        </View>
      )}
      <Button size="md" variant="outline" label={t('Sign Out')} onPress={handleSignOut} className="mt-10 " />

      <View className="mt-8">
        <Card
          onPress={handleDeleteAccountPress}
          variant="soft"
          contentClassName="items-center"
          className="border-error/40"
        >
          <Text variant="title" tone="error">
            {t('Delete Account')}
          </Text>

          <Text variant="bodySmall" className="text-muted">
            {t('Delete personal data while keeping anonymized league history.')}
          </Text>
        </Card>
      </View>
    </Screen>
  );
};

export default SettingsScreen;
