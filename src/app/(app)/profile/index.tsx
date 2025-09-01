import { LoadingOverlay, Screen } from '@/components/layout';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { BackButton, Button } from '@/components/ui';
import { useSubscription } from '@/hooks/useSubscription';
import { useGetUser } from '@/hooks/useUsers';
import { useAuth } from '@/services/useAuth';
import { Tables } from '@/types/database.types';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';

export default function Profile() {
  const { data: user, isLoading } = useGetUser();
  const { data: subscription, isLoading: isLoadingSubscription } =
    useSubscription();
  console.log('subscription', JSON.stringify(subscription, null, 2));

  const { signOut, isLoading: isLoadingAuth, isError } = useAuth();

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

  // --- Cancel edit ---

  return (
    <Screen>
      {isLoading || (isLoadingSubscription && <LoadingOverlay />)}
      <BackButton />
      <View className="flex-1">
        <ProfileHeader fullName={user?.full_name} email={user?.email} />
        <ProfileContent
          created_at={user?.created_at}
          subscription={subscription as Tables<'subscription'> | undefined}
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
}
