import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useState } from 'react';

import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import GoogleSignInButton from './ui/GoogleSignInButton';

const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '';
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '';

const GoogleAuth = () => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    offlineAccess: false,
    iosClientId: IOS_CLIENT_ID,
    profileImageSize: 120,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();

      if (isSuccessResponse(res)) {
        const idToken = res.data.idToken;
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken as string,
        });
        if (error) throw new Error(error.message);
      } else {
        throw new Error('Google sign in failed');
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert('Error', 'User cancelled the login flow');

            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Play services not available');
            break;
          case statusCodes.SIGN_IN_REQUIRED:
            Alert.alert('Error', 'Sign in required');
            break;
          default:
            Alert.alert('Error', 'Google sign in failed');
        }
      } else {
        Alert.alert('Error', 'Google sign in failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleSignInButton
      onPress={handleGoogleSignIn}
      loading={isLoading}
      disabled={isLoading}
    />
  );
};

export default GoogleAuth;
