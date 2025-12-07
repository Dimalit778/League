import { LoadingOverlay } from '@/components/layout';
import { BackButton, Button, CText } from '@/components/ui';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import SettingsContent from '@/features/settings/components/Settings/SettingsContent';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/AuthStore';
import { Tables } from '@/types/database.types';
import { formatNameCapitalize } from '@/utils/formats';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  if (!user || isLoading) return <LoadingOverlay />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title={t('Settings')} />

      <View className="flex-1 ">
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
      </View>
      <View className="pb-10">
        <Button
          title={t('Sign Out')}
          color="red"
          className="mx-auto w-1/3"
          onPress={handleSignOut}
          disabled={isLoadingAuth}
        />
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
