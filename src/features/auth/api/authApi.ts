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
      password: password,
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

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullname, provider: 'email' },
      },
    });

    if (error) throw error;

    if (data.user && data.user.identities?.length === 0) {
      throw new Error('Email already registered');
    }

    return { success: true };
  } catch (error: any) {
    const userFriendlyError = formatErrorForUser(error);
    return { success: false, error: userFriendlyError };
  }
};


// Sign Out
export const signOut = async (queryClient: QueryClient) => {
  // Always attempt the remote sign-out, even if the local session is
  // expired, revoked, or missing — Supabase errors here must not block logout.
  try {
    const { error } = await supabase.auth.signOut();
    if (error && error.message !== 'Auth session missing!') {
      console.log('signOutError', JSON.stringify(error, null, 2));
    }
  } catch (signOutError) {
    console.log('signOutError', JSON.stringify(signOutError, null, 2));
  }

  // Clear member store
  useMemberStore.getState().clearMember();

  // Drop all cached server data so the next user on this device starts fresh
  queryClient.clear();

  return { success: true };
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
