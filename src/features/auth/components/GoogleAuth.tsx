import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useState } from 'react';

import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';
import { Alert, Text } from 'react-native';
import GoogleSignInButton from './GoogleSignInButton';

const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';

const GoogleAuth = ({
  setIsLoading,
  isLoading,
}: {
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}) => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    offlineAccess: false,
    iosClientId: IOS_CLIENT_ID,
    profileImageSize: 120,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

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
        throw new Error('Google sign in was cancelled or failed');
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

      setErrorMessage(userMessage);
      Alert.alert('Sign In Error', userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GoogleSignInButton onPress={handleGoogleSignIn} loading={isLoading} disabled={isLoading} />
      {errorMessage && <Text className="text-error text-sm text-center mt-2">{errorMessage}</Text>}
    </>
  );
};

export default GoogleAuth;
