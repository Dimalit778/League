import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, CText } from '@/components/ui';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import SettingsContent from '@/features/settings/components/Settings/SettingsContent';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/AuthStore';
import { Tables } from '@/types/database.types';
import { formatNameCapitalize } from '@/utils/formats';
import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const SettingsScreen = () => {
  const user = useAuthStore((s) => s.user);
  const fullName = formatNameCapitalize(user?.full_name);

  const { data: subscription, isLoading } = useSubscription();

  const { signOut, isLoading: isLoadingAuth } = useAuthActions();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    const result = await signOut();

    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert(t('Error'), result.error || t('Failed to sign out'));
    }
  };
  const handleDeleteAccountPress = () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: deleteAccount,
      },
    ]);
  };

  const deleteAccount = async () => {
    console.log('deleteAccount');
  };
  if (!user || isLoading) return <LoadingOverlay />;

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
            subscription={subscription as Tables<'subscription'> | undefined}
            email={user?.email}
          />
        </View>

        {user?.role === 'ADMIN' && (
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
          <CText className="mb-3 text-xs font-bold tracking-widest text-red-400">DANGER ZONE</CText>

          <Pressable
            onPress={handleDeleteAccountPress}
            className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-4"
          >
            <CText className="text-red-400 font-bold text-base">Delete Account</CText>

            <CText className="mt-1 text-muted text-sm">Permanently delete your account and personal data.</CText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default SettingsScreen;
