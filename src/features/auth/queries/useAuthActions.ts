// src/features/auth/hooks/useAuthActions.ts
import { checkNetworkConnection } from '@/hooks/useNetworkStatus';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useMemberStore } from '@/store/MemberStore';
import { formatErrorForUser } from '@/utils/errorFormats';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

// Create redirect URI for password reset
const getPasswordResetRedirectUri = () => {
  const uri = AuthSession.makeRedirectUri({
    scheme: 'league',
    path: 'resetPassword',
  });
  // Force custom scheme in development (AuthSession.makeRedirectUri can return localhost in dev)
  if (uri.startsWith('localhost://') || uri.startsWith('http://localhost')) {
    return 'league://resetPassword';
  }
  return uri;
};

export const useAuthActions = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signOut() {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session found');
      }

      try {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== 'Auth session missing!') {
          throw error;
        }
      } catch (signOutError) {
        console.error('Failed to sign out:', signOutError);
      }

      useMemberStore.getState().clearAll();

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.users.all });

      try {
        const keys = ['supabase.auth.token', 'supabase-auth-token'];
        await AsyncStorage.multiRemove(keys);
      } catch (storageError) {
        console.warn('Failed to manually clear auth storage:', storageError);
      }

      return { success: true };
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message || 'Failed to sign out');
      console.error('Sign out error:', error);
      return { success: false, error: error.message || 'Failed to sign out' };
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullname: string) {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        const networkError = 'No internet connection. Please check your network and try again.';
        setIsError(true);
        setErrorMessage(networkError);
        return { success: false, error: networkError };
      }
      console.log('email', email);
      console.log('password', password);
      console.log('fullname', fullname);

      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullname, provider: 'email', role: 'USER' },
        },
      });
      console.log('error ------->,', JSON.stringify(error));

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      const userFriendlyError = formatErrorForUser(error);
      setIsError(true);
      setErrorMessage(userFriendlyError);
      return { success: false, error: userFriendlyError };
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        const networkError = 'No internet connection. Please check your network and try again.';
        setIsError(true);
        setErrorMessage(networkError);
        return { success: false, error: networkError };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) throw error;

      await useMemberStore.getState().initializeMember();

      return { success: true };
    } catch (error: any) {
      const userFriendlyError = formatErrorForUser(error);
      setIsError(true);
      setErrorMessage(userFriendlyError);
      return { success: false, error: userFriendlyError };
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const googleRedirectUri = AuthSession.makeRedirectUri({
        scheme: 'league',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: googleRedirectUri,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      if (!data?.url) {
        throw new Error('Failed to start Google sign in.');
      }

      const authResult = await WebBrowser.openAuthSessionAsync(data.url, googleRedirectUri);

      if (authResult.type !== 'success' || !authResult.url) {
        throw new Error(
          authResult.type === 'dismiss' || authResult.type === 'cancel'
            ? 'Google sign in was cancelled.'
            : 'Google sign in failed.'
        );
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.user) {
        throw new Error('No active session found after Google sign in.');
      }

      await useMemberStore.getState().initializeMember();

      return { success: true };
    } catch (error: any) {
      setIsError(true);
      const message = error.message || 'Failed to sign in with Google';
      setErrorMessage(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyOtp(email: string, token: string) {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        const networkError = 'No internet connection. Please check your network and try again.';
        setIsError(true);
        setErrorMessage(networkError);
        return { success: false, error: networkError };
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'email',
      });

      if (error) throw error;

      if (!session?.user) {
        throw new Error('Verification failed. Please try again.');
      }

      await useMemberStore.getState().initializeMember();

      return { success: true };
    } catch (error: any) {
      const userFriendlyError = formatErrorForUser(error);
      setIsError(true);
      setErrorMessage(userFriendlyError);
      return { success: false, error: userFriendlyError };
    } finally {
      setIsLoading(false);
    }
  }

  async function resendOtp(email: string) {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        const networkError = 'No internet connection. Please check your network and try again.';
        setIsError(true);
        setErrorMessage(networkError);
        return { success: false, error: networkError };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      const userFriendlyError = formatErrorForUser(error);
      setIsError(true);
      setErrorMessage(userFriendlyError);
      return { success: false, error: userFriendlyError };
    } finally {
      setIsLoading(false);
    }
  }

  async function resendPasswordResetOtp(email: string) {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        const networkError = 'No internet connection. Please check your network and try again.';
        setIsError(true);
        setErrorMessage(networkError);
        return { success: false, error: networkError };
      }

      // For password reset, we need to call resetPasswordForEmail again
      const redirectTo = getPasswordResetRedirectUri();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      const userFriendlyError = formatErrorForUser(error);
      setIsError(true);
      setErrorMessage(userFriendlyError);
      return { success: false, error: userFriendlyError };
    } finally {
      setIsLoading(false);
    }
  }

  async function sendResetPasswordLink(email: string) {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        const networkError = 'No internet connection. Please check your network and try again.';
        setIsError(true);
        setErrorMessage(networkError);
        return { success: false, error: networkError };
      }

      const redirectTo = getPasswordResetRedirectUri();
      console.log('redirectTo', redirectTo);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      const userFriendlyError = formatErrorForUser(error);
      setIsError(true);
      setErrorMessage(userFriendlyError);
      return { success: false, error: userFriendlyError };
    } finally {
      setIsLoading(false);
    }
  }

  return {
    signOut,
    signUp,
    signIn,
    signInWithGoogle,
    verifyOtp,
    resendOtp,
    sendResetPasswordLink,

    resendPasswordResetOtp,
    isLoading,
    isError,
    errorMessage,
    clearError: () => {
      setIsError(false);
      setErrorMessage(null);
    },
  };
};
