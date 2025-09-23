import EditUser from '@/components/EditUser';
import { LoadingOverlay, Screen } from '@/components/layout';
import SettingsContent from '@/components/settings/SettingsContent';
import { Button } from '@/components/ui';
import { useSubscription } from '@/hooks/useSubscription';
import { useGetUser } from '@/hooks/useUsers';
import { useAuth } from '@/services/useAuth';
import { Tables } from '@/types/database.types';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';

const Settings = () => {
  const { data: user, isLoading } = useGetUser();
  const { data: subscription, isLoading: isLoadingSubscription } =
    useSubscription();

  const { signOut, isLoading: isLoadingAuth } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const result = await signOut();

          if (result.success) {
            router.replace('/');
          } else {
            Alert.alert('Error', result.error || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      {isLoading || (isLoadingSubscription && <LoadingOverlay />)}

      <View className="flex-1">
        <View className="mx-2 my-1">
          <EditUser />
        </View>
        <SettingsContent
          created_at={user?.created_at}
          subscription={subscription as Tables<'subscription'> | undefined}
          email={user?.email}
        />
      </View>
      <View className="pb-10">
        <Button
          title="Sign Out"
          color="red"
          className="mx-auto w-1/3"
          onPress={handleSignOut}
          disabled={isLoadingAuth}
        />
      </View>
    </Screen>
  );
};

export default Settings;
