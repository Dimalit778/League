import { Button, Screen } from '@/components';
import { useIsAdmin } from '@/features/admin/hooks/useAdmin';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import SettingsContent from '@/features/settings/components/Settings/SettingsContent';
import { usesAppleIdentity } from '@/features/settings/api/usersApi';
import { useDeleteUser } from '@/features/settings/hooks/useUsers';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/providers/AlertProvider';
import { useAuthStore } from '@/store/AuthStore';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';

const SettingsScreen = () => {
  const { data: isAdmin } = useIsAdmin();
  const deleteUserMutation = useDeleteUser();
  const { signOut } = useAuthActions();
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const session = useAuthStore((state) => state.session);

  const confirmDeleteAccount = () => {
    // Apple users are re-prompted to sign in with Apple mid-flow (required to
    // revoke the Apple grant); warn them up front so the screen isn't a surprise.
    const isAppleUser = !!session?.user && usesAppleIdentity(session.user);
    const message = isAppleUser
      ? `${t('Delete account confirmation message')}\n\n${t('Delete account apple note')}`
      : t('Delete account confirmation message');

    showAlert({
      title: t('Delete Account'),
      message,
      type: 'warning',
      buttons: [
        { text: t('Cancel'), style: 'cancel' },
        { text: t('Delete'), style: 'destructive', onPress: () => deleteUserMutation.mutate() },
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
        <SettingsContent onSignOut={handleSignOut} onDeleteAccount={confirmDeleteAccount} />
      </View>

      {isAdmin && (
        <View className="mt-8 px-6">
          <Button label={t('Open Admin Dashboard')} onPress={() => router.push('/admin')} intent="outline" />
        </View>
      )}
    </Screen>
  );
};

export default SettingsScreen;
