import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useMemberStore } from '@/store/MemberStore';
import { checkNetworkConnection } from '@/hooks/useNetworkStatus';
import { formatErrorForUser } from '@/utils/networkErrorHandler';
import { useQueryClient } from '@tanstack/react-query';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'league',
  path: 'auth/callback',
});

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signOut() {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      try {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== 'Auth session missing!') {
          throw error;
        }
      } catch (signOutError) {
        Alert.alert('Error', 'Failed to sign out');
      }

      useMemberStore.getState().clearAll();

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.users.all });

      try {
        const keys = ['supabase.auth.token', 'supabase-auth-token'];
        const AsyncStorage =
          require('@react-native-async-storage/async-storage').default;
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
      // Check network connection before making request
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        const networkError = 'No internet connection. Please check your network and try again.';
        setIsError(true);
        setErrorMessage(networkError);
        return { success: false, error: networkError };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullname, provider: 'email', role: 'USER' },
        },
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
  async function signIn(email: string, password: string) {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    
    try {
      // Check network connection before making request
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        const networkError = 'No internet connection. Please check your network and try again.';
        setIsError(true);
        setErrorMessage(networkError);
        return { success: false, error: networkError };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      // Sync MemberStore after successful sign in
      await useMemberStore.getState().initializeMemberLeagues();

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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
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

      const authResult = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );

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

      await useMemberStore.getState().initializeMemberLeagues();

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

  return {
    signOut,
    signUp,
    signIn,
    signInWithGoogle,
    isLoading,
    isError,
    errorMessage,
    clearError: () => {
      setIsError(false);
      setErrorMessage(null);
    },
  };
};
