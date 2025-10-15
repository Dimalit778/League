import { LoadingOverlay } from '@/components/layout';
import SettingsContent from '@/components/settings/SettingsContent';
import { BackButton, Button } from '@/components/ui';
import { useSubscription } from '@/hooks/useSubscription';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useGetUser } from '@/hooks/useUsers';
import { useAuth } from '@/services/useAuth';
import { Tables } from '@/types/database.types';
import FontAwesome6 from '@expo/vector-icons/build/FontAwesome6';
import { router } from 'expo-router';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  const { data: user, isLoading } = useGetUser();

  const { data: subscription, isLoading: isLoadingSubscription } =
    useSubscription();

  const { signOut, isLoading: isLoadingAuth } = useAuth();
  const theme = useThemeTokens();

  const handleSignOut = async () => {
    const result = await signOut();

    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Error', result.error || 'Failed to sign out');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="Settings" />
      {(isLoading || isLoadingSubscription) && <LoadingOverlay />}

      <View className="flex-1 ">
        <View className="mt-8 mx-3  flex-row justify-between items-center p-4 bg-surface rounded-xl border border-border">
          <Text className="text-text text-3xl">{user?.full_name}</Text>
          <TouchableOpacity onPress={() => router.push('/settings/edit-user')}>
            <FontAwesome6
              name="pen-to-square"
              size={16}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>
        </View>
        <View className=" mt-12">
          <SettingsContent
            created_at={user?.created_at}
            subscription={subscription as Tables<'subscription'> | undefined}
            email={user?.email}
          />
        </View>
        <View className="mt-8 px-6">
          <Button
            title="Open Admin Dashboard"
            onPress={() => router.push('/(app)/(admin)/competitions')}
            variant="secondary"
          />
        </View>
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
    </SafeAreaView>
  );
}
