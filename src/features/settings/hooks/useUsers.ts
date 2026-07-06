import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import * as usersApi from '../api/usersApi';

export const useDeleteUser = () => {
  const { signOut } = useAuthActions();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => usersApi.deleteUser(),
    onSuccess: async () => {
      // signOut clears the member store and the entire query cache
      await signOut();
      router.replace('/');
    },
    onError: (error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};