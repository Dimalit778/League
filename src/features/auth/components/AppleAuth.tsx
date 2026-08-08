import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

const AppleAuth = ({
  setIsLoading,
  isLoading,
  mode = 'signIn',
}: {
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  mode?: 'signIn' | 'signUp';
}) => {
  const [available, setAvailable] = useState(false);
  const errorMessageRef = useRef<string | null>(null);

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
    if (isLoading) return;

    try {
      setIsLoading(true);
      errorMessageRef.current = null;

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple did not return identityToken');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;

      if (!data?.session?.user?.id) {
        throw new Error('Failed to create session after Apple sign in');
      }

      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');

      if (fullName) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          data: { full_name: fullName },
        });
        if (updateAuthError) throw updateAuthError;
      }
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
      errorMessageRef.current = userMessage;
      Alert.alert('Sign In Error', userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, setIsLoading]);

  if (Platform.OS !== 'ios' || !available) {
    return null;
  }

  const buttonType =
    mode === 'signUp'
      ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
      : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={buttonType}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
      cornerRadius={14}
      style={{ width: '100%', height: 56, opacity: isLoading ? 0.6 : 1 }}
      onPress={handleAppleSignIn}
    />
  );
};

export default AppleAuth;
