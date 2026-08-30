import { images } from '@/assets/images';
import { createLegalAcceptanceContext, recordSocialLegalAcceptance } from '@/features/auth/legalAcceptance';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet } from 'react-native';

const AppleAuth = ({
  setIsLoading,
  isLoading,
  mode = 'signIn',
  legalAccepted,
}: {
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  mode?: 'signIn' | 'signUp';
  legalAccepted: boolean;
}) => {
  const { t } = useTranslation();
  const [available, setAvailable] = useState(Platform.OS === 'ios');

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let cancelled = false;
    AppleAuthentication.isAvailableAsync()
      .then((ok) => {
        if (!cancelled) setAvailable(ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAppleSignIn = useCallback(async () => {
    if (isLoading || !legalAccepted) return;

    try {
      setIsLoading(true);

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

      try {
        await recordSocialLegalAcceptance(
          createLegalAcceptanceContext('apple', mode === 'signUp' ? 'sign_up' : 'social_continue'),
        );
      } catch (acceptanceError) {
        await supabase.auth.signOut();
        throw acceptanceError;
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
      Alert.alert(t('Sign In Error'), t(userMessage));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, legalAccepted, mode, setIsLoading, t]);

  if (Platform.OS !== 'ios' || !available) {
    return null;
  }

  const blocked = isLoading || !legalAccepted;
  const label = t('Continue with Apple');

  return (
    <Pressable
      testID="apple-sign-in-button"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked }}
      disabled={blocked}
      onPress={handleAppleSignIn}
      className="h-[52px] items-center justify-center rounded-md active:opacity-80"
    >
      <Image
        source={images.appleWhite360}
        style={styles.image}
        contentFit="contain"
        pointerEvents="none"
        accessible={false}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    height: 52,
    overflow: 'hidden',
    width: '100%',
    flexShrink: 0,
  },
  hit: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  image: {
    height: 52,
    width: '100%',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.5,
  },
});
export default AppleAuth;
