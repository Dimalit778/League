import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

const usesAppleIdentity = (user: {
  identities?: { provider: string }[];
  app_metadata?: { provider?: string; providers?: string[] };
}) =>
  user.identities?.some((identity) => identity.provider === 'apple') === true ||
  user.app_metadata?.provider === 'apple' ||
  user.app_metadata?.providers?.includes('apple') === true;

export const deleteUser = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw new Error(formatErrorForUser(sessionError));
  if (!session?.user) throw new Error('You must be signed in to delete your account');

  let appleAuthorizationCode: string | null = null;
  if (usesAppleIdentity(session.user)) {
    if (Platform.OS !== 'ios') {
      throw new Error('Sign in with Apple account deletion must be completed on an iOS device');
    }

    const credential = await AppleAuthentication.signInAsync({ requestedScopes: [] });
    appleAuthorizationCode = credential.authorizationCode;

    if (!appleAuthorizationCode) {
      throw new Error('Apple reauthentication did not return an authorization code');
    }
  }

  const { error } = await supabase.functions.invoke('delete-account', {
    body: { appleAuthorizationCode },
  });

  if (error) {
    throw new Error(formatErrorForUser(error));
  }
};
