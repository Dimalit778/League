import { checkNetworkConnection } from '@/hooks/useNetworkStatus';
import { KEYS } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useMemberStore } from '@/store/MemberStore';
import { formatErrorForUser } from '@/utils/errorFormats';
import type { QueryClient } from '@tanstack/react-query';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Helper: Create redirect URI for password reset
const getPasswordResetRedirectUri = () => {
  const uri = AuthSession.makeRedirectUri({
    scheme: 'league',
    path: 'resetPassword',
  });
  if (uri.startsWith('localhost://') || uri.startsWith('http://localhost')) {
    return 'league://resetPassword';
  }
  return uri;
};

// Sign In
export const signIn = async (email: string, password: string, queryClient: QueryClient) => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (error) throw error;

    // Get userId from session and invalidate primary member query to refetch
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await queryClient.invalidateQueries({ queryKey: KEYS.members.primary(session.user.id) });
    }

    return { success: true };
  } catch (error: any) {
    const userFriendlyError = formatErrorForUser(error);
    return { success: false, error: userFriendlyError };
  }
};

// Sign Up
export const signUp = async (email: string, password: string, fullname: string) => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullname, provider: 'email', role: 'USER' },
      },
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    const userFriendlyError = formatErrorForUser(error);
    return { success: false, error: userFriendlyError };
  }
};

// Sign In with Google
export const signInWithGoogle = async () => {
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

    return { success: true };
  } catch (error: any) {
    const message = error.message || 'Failed to sign in with Google';
    return { success: false, error: message };
  }
};

// Sign Out
export const signOut = async (queryClient: QueryClient) => {
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

    // Clear member store
    useMemberStore.getState().clearMember();

    // Clear queries
    queryClient.invalidateQueries({ queryKey: KEYS.users.all });
    queryClient.removeQueries({ queryKey: KEYS.users.all });

    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message || 'Failed to sign out' };
  }
};

// Verify OTP
export const verifyOtp = async (email: string, token: string) => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
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

    return { success: true };
  } catch (error: any) {
    const userFriendlyError = formatErrorForUser(error);
    return { success: false, error: userFriendlyError };
  }
};

// Resend OTP
export const resendOtp = async (email: string) => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    const userFriendlyError = formatErrorForUser(error);
    return { success: false, error: userFriendlyError };
  }
};

// Send Reset Password Link
export const sendResetPasswordLink = async (email: string) => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const redirectTo = getPasswordResetRedirectUri();

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    const userFriendlyError = formatErrorForUser(error);
    return { success: false, error: userFriendlyError };
  }
};

// Resend Password Reset OTP
export const resendPasswordResetOtp = async (email: string) => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const redirectTo = getPasswordResetRedirectUri();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    const userFriendlyError = formatErrorForUser(error);
    return { success: false, error: userFriendlyError };
  }
};
