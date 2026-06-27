import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import * as usersApi from '../api/usersApi';

export const useDeleteUser = () => {
  const { signOut } = useAuthActions();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => usersApi.deleteUser(),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: KEYS.users.all });
      queryClient.removeQueries({ queryKey: KEYS.users.all });
      await signOut();
      router.replace('/');
    },
    onError: (error) => {
      Alert.alert(t('Error'), error.message);
    },
  });
};