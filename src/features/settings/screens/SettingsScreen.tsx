import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, CText } from '@/components/ui';
import { useIsAdmin } from '@/features/admin/hooks/useAdmin';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import SettingsContent from '@/features/settings/components/Settings/SettingsContent';
import { useDeleteUser } from '@/features/settings/hooks/useUsers';
import { useTranslation } from '@/hooks/useTranslation';
import { useRevenueCatSubscription } from '@/lib/revenuecat/purchases';
import { useAuthStore } from '@/store/AuthStore';
import { formatNameCapitalize } from '@/utils/formats';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const SettingsScreen = () => {
  const user = useAuthStore((s) => s.user);
  const fullName = formatNameCapitalize(user?.full_name);
  const { data: isAdmin } = useIsAdmin();

  const { subscription } = useRevenueCatSubscription();
  const deleteUserMutation = useDeleteUser();
  const { signOut } = useAuthActions();
  const { t } = useTranslation();
  const handleDeleteAccountPress = useCallback(() => {
    Alert.alert(
      t('Delete Account'),
      t('Delete account confirmation message'),
      [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => deleteUserMutation.mutate(),
        },
      ],
    );
  }, [deleteUserMutation, t]);
  const handleSignOut = async () => {
    const result = await signOut();

    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert(t('Error'), result.error || t('Failed to sign out'));
    }
  };
  if (!user) return <LoadingOverlay />;

  return (
    <Screen withSafeArea>
      <BackButton title={t('Settings')} />

      <ScrollView className="flex-1 px-2" showsVerticalScrollIndicator={false}>
        <View className="mt-8 mx-3  flex-row justify-between items-center p-4 bg-surface rounded-xl border border-border">
          <CText className="text-text text-3xl">{fullName}</CText>
        </View>
        <View className=" mt-12">
          <SettingsContent
            created_at={user?.created_at}
            subscriptionType={subscription.isActive ? 'PRO' : 'FREE'}
            email={user?.email}
          />
        </View>

        {isAdmin && (
          <View className="mt-8 px-6">
            <Button
              title={t('Open Admin Dashboard')}
              onPress={() => router.push('/(app)/(admin)/competitions')}
              variant="secondary"
            />
          </View>
        )}
        <Pressable
          onPress={handleSignOut}
          className="mt-6 flex-row items-center justify-between border-b border-border py-4"
        >
          <CText variant="body" className="text-orange-400">
            {t('Sign Out')}
          </CText>
        </Pressable>

        <View className="mt-8">
          <Pressable
            onPress={handleDeleteAccountPress}
            className="items-center rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-4"
          >
            <CText className="text-red-400 font-bold text-base">{t('Delete Account')}</CText>

            <CText className="mt-1 text-muted text-sm">{t('Permanently delete your account and all your data.')}</CText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default SettingsScreen;
