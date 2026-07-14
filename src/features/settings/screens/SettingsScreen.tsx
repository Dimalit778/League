import { Screen } from '@/components/layout';
import { BackButton, Button, Text } from '@/components/ui';
import { useIsAdmin } from '@/features/admin/hooks/useAdmin';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import SettingsContent from '@/features/settings/components/Settings/SettingsContent';
import { useDeleteUser } from '@/features/settings/hooks/useUsers';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const { data: isAdmin } = useIsAdmin();
  const insets = useSafeAreaInsets();
  const deleteUserMutation = useDeleteUser();
  const { signOut } = useAuthActions();
  const { t } = useTranslation();

  const handleDeleteAccountPress = useCallback(() => {
    Alert.alert(t('Delete Account'), t('Delete account confirmation message'), [
      {
        text: t('Cancel'),
        style: 'cancel',
      },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: () => deleteUserMutation.mutate(),
      },
    ]);
  }, [deleteUserMutation, t]);

  const handleSignOut = async () => {
    const result = await signOut();

    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert(t('Error'), result.error || t('Failed to sign out'));
    }
  };

  return (
    <Screen edges={['top']}>
      <BackButton title={t('Settings')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
          paddingHorizontal: 12,
        }}
      >
        <View className="mt-2">
          <SettingsContent />
        </View>

        {isAdmin && (
          <View className="mt-8 px-6">
            <Button
              title={t('Open Admin Dashboard')}
              onPress={() => router.push('/(app)/(admin)/competitions')}
              variant="outline"
            />
          </View>
        )}
        <Button size="md" variant="outline" title={t('Sign Out')} onPress={handleSignOut} className="mt-10 " />

        <View className="mt-8">
          <Pressable
            onPress={handleDeleteAccountPress}
            className="items-center rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-4"
          >
            <Text bold className="text-red-400">
              {t('Delete Account')}
            </Text>

            <Text className="mt-1 text-muted">{t('Permanently delete your account and all your data.')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default SettingsScreen;
