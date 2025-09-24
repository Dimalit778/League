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
    hostedDomain: '', // specifies a hosted domain restriction
    forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
    accountName: '', // [Android] specifies an account name on the device that should be used
    iosClientId: IOS_CLIENT_ID, // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
    openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
    profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
  });
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('userInfo -->', JSON.stringify(userInfo, null, 2));

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log('response -->', JSON.stringify(response, null, 2));

      if (isSuccessResponse(response)) {
        setUserInfo(response.data.idToken);
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.data.idToken as string,
        });
        if (error) throw new Error(error.message);
        console.log('error', JSON.stringify(error, null, 2));
        console.log('signed successfully', JSON.stringify(data, null, 2));
      } else {
        throw new Error('Google sign in failed');
      }
    } catch (error: any) {
      console.log('failed', error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert('Error', 'User cancelled the login flow');
            console.log('User cancelled the login flow');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Play services not available');
            console.log('Play services not available');
            break;
          case statusCodes.SIGN_IN_REQUIRED:
            Alert.alert('Error', 'Sign in required');
            console.log('Sign in required');
            break;
          default:
            Alert.alert('Error', 'Google sign in failed');
            console.log('Google sign in failed');
        }
      } else {
        console.log('Google sign in failed');
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
