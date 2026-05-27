import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { KEYS } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';
import { useQueryClient } from '@tanstack/react-query';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import AppleSignInButton from './AppleSignInButton';

const AppleAuth = ({
  setIsLoading,
  isLoading,
  labelKey,
}: {
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  /** i18n key, e.g. "Sign in with Apple" or "Sign up with Apple" */
  labelKey: string;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [available, setAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let cancelled = false;
    AppleAuthentication.isAvailableAsync().then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAppleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential.identityToken;
      if (!identityToken) {
        throw new Error('Failed to get authentication token from Apple');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: identityToken,
      });

      if (error) throw error;
      if (!data?.session?.user?.id) {
        throw new Error('Failed to create session after Apple sign in');
      }

      await queryClient.invalidateQueries({ queryKey: KEYS.members.primary(data.session.user.id) });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'ERR_REQUEST_CANCELED'
      ) {
        return;
      }

      const userMessage = formatErrorForUser(error) || 'Apple sign in failed. Please try again.';
      setErrorMessage(userMessage);
      Alert.alert('Sign In Error', userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, setIsLoading]);

  if (Platform.OS !== 'ios' || !available) {
    return null;
  }

  return (
    <View className="gap-2">
      <AppleSignInButton onPress={handleAppleSignIn} loading={isLoading} disabled={isLoading} label={t(labelKey)} />
      {errorMessage && <CText className="text-error text-sm text-center mt-1">{errorMessage}</CText>}
    </View>
  );
};

export default AppleAuth;
