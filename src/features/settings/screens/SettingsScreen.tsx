import { LoadingOverlay } from '@/components/layout';
import { BackButton, Button } from '@/components/ui';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import SettingsContent from '@/features/settings/components/Settings/SettingsContent';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useAuthStore } from '@/store/AuthStore';
import { Tables } from '@/types/database.types';
import { formatNameCapitalize } from '@/utils/formats';
import FontAwesome6 from '@expo/vector-icons/build/FontAwesome6';
import { router } from 'expo-router';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const user = useAuthStore((s) => s.user);
  const fullName = formatNameCapitalize(user?.full_name);

  const { data: subscription, isLoading } = useSubscription();

  const { signOut, isLoading: isLoadingAuth } = useAuthActions();
  const theme = useThemeTokens();

  const handleSignOut = async () => {
    const result = await signOut();

    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Error', result.error || 'Failed to sign out');
    }
  };
  if (!user || isLoading) return <LoadingOverlay />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton title="Settings" />

      <View className="flex-1 ">
        <View className="mt-8 mx-3  flex-row justify-between items-center p-4 bg-surface rounded-xl border border-border">
          <Text className="text-text text-3xl">{fullName}</Text>
          <TouchableOpacity onPress={() => router.push('/settings/edit-user')}>
            <FontAwesome6 name="pen-to-square" size={16} color={theme.colors.secondary} />
          </TouchableOpacity>
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
              title="Open Admin Dashboard"
              onPress={() => router.push('/(app)/(admin)/competitions')}
              variant="secondary"
            />
          </View>
        )}
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
};

export default SettingsScreen;
