import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

import { Button } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';
import { GoogleLogoIcon } from '@assets/icons';

const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';

const GoogleAuth = ({
  setIsLoading,
  isLoading,
}: {
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
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

  const label = t('Sign in with Google');

  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
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

  return (
    <Button
      testID="google-sign-in-button"
      onPress={handleGoogleSignIn}
      disabled={isLoading}
      accessibilityLabel={label}
      accessibilityHint={label}
      variant="outline"
      size="icon"
      className="h-[52px] w-[52px] rounded-[12px] border border-border bg-background"
    >
      <GoogleLogoIcon size={24} />
    </Button>
  );
};

export default GoogleAuth;
