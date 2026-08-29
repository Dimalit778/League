import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components';
import {
  clearPendingWebLegalAcceptance,
  createLegalAcceptanceContext,
  recordSocialLegalAcceptance,
  savePendingWebLegalAcceptance,
} from '@/features/auth/legalAcceptance';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';

function GoogleGIcon({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';

const GoogleAuth = ({
  setIsLoading,
  isLoading,
  mode,
  legalAccepted,
}: {
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  mode: 'signIn' | 'signUp';
  legalAccepted: boolean;
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
      iosClientId: IOS_CLIENT_ID,
      profileImageSize: 120,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    if (isLoading || !legalAccepted) return;

    try {
      setIsLoading(true);
      const acceptance = createLegalAcceptanceContext('google', mode === 'signUp' ? 'sign_up' : 'social_continue');

      if (Platform.OS === 'web') {
        savePendingWebLegalAcceptance(acceptance);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          clearPendingWebLegalAcceptance();
          throw error;
        }
        // Browser navigates away; keep loading until then.
        return;
      }

      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();

      if (isSuccessResponse(res)) {
        const idToken = res.data.idToken;
        if (!idToken) {
          throw new Error('Failed to get authentication token from Google');
        }

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken as string,
        });

        if (error) {
          throw error;
        }

        if (!data?.session) {
          throw new Error('Failed to create session after Google sign in');
        }

        try {
          await recordSocialLegalAcceptance(acceptance);
        } catch (acceptanceError) {
          await supabase.auth.signOut();
          throw acceptanceError;
        }
      } else {
        return;
      }
    } catch (error: any) {
      let userMessage: string;

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // User cancelled - don't show error, just return
            setIsLoading(false);
            return;
          case statusCodes.IN_PROGRESS:
            userMessage = 'Sign in is already in progress. Please wait.';
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            userMessage = 'Google Play Services is not available. Please update your device.';
            break;
          case statusCodes.SIGN_IN_REQUIRED:
            userMessage = 'Please sign in to your Google account in your device settings.';
            break;
          default:
            userMessage = formatErrorForUser(error) || 'Google sign in failed. Please try again.';
        }
      } else {
        userMessage = formatErrorForUser(error) || 'Google sign in failed. Please try again.';
      }

      Alert.alert(t('Sign In Error'), t(userMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const label = t('Continue with Google');
  const blocked = isLoading || !legalAccepted;

  return (
    <Pressable
      testID="google-sign-in-button"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked }}
      disabled={blocked}
      onPress={handleGoogleSignIn}
      style={({ pressed }) => [styles.touchable, blocked && styles.disabled, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <GoogleGIcon width={22} height={22} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    height: 52,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  label: {
    color: '#1F1F1F',
    fontSize: 22,
    fontWeight: '500',

    ...(Platform.OS === 'android' && {
      fontFamily: 'sans-serif-medium',
    }),
  },

  pressed: {
    opacity: 0.82,
  },

  disabled: {
    opacity: 0.5,
  },
});
export default GoogleAuth;
