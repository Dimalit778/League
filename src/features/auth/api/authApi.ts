import { checkNetworkConnection } from '@/hooks/useNetworkStatus';
import { KEYS } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { formatErrorForUser } from '@/utils/errorFormats';
import type { QueryClient } from '@tanstack/react-query';
import * as AuthSession from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export type AuthActionResult = { success: true } | { success: false; error: string };

/**
 * Shared shell for every auth action: fail fast when offline, run the action,
 * and turn any thrown error into a user-friendly `{ success: false, error }`.
 * This removes the connection-check + try/catch + `formatErrorForUser`
 * boilerplate (and the `catch (error: any)`) that every action repeated.
 */
const withNetworkGuard = async (action: () => Promise<void>): Promise<AuthActionResult> => {
  try {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    await action();
    return { success: true };
  } catch (error) {
    return { success: false, error: formatErrorForUser(error) };
  }
};

// Helper: Create redirect URI for password reset
const getPasswordResetRedirectUri = () => {
  const uri = AuthSession.makeRedirectUri({
    scheme: 'champo',
    path: 'resetPassword',
  });
  if (uri.startsWith('localhost://') || uri.startsWith('http://localhost')) {
    return 'champo://resetPassword';
  }
  return uri;
};

// Sign In
export const signIn = (email: string, password: string, queryClient: QueryClient) =>
  withNetworkGuard(async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw error;

    // Get userId from session and invalidate primary member query to refetch
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await queryClient.invalidateQueries({ queryKey: KEYS.members.primaryLeague(session.user.id) });
    }
  });

// Sign Up
export const signUp = (email: string, password: string, fullname: string) =>
  withNetworkGuard(async () => {
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
  });

// Sign Out
export const signOut = async (queryClient: QueryClient) => {
  // Always attempt the remote sign-out, even if the local session is
  // expired, revoked, or missing — Supabase errors here must not block logout.
  try {
    await supabase.auth.signOut();
  } catch {
    // Remote sign-out is best-effort; local cleanup below must run regardless.
  }

  usePrimaryLeagueStore.getState().clearPrimaryLeague();

  // Drop all cached server data so the next user on this device starts fresh
  queryClient.clear();

  return { success: true };
};

// Verify OTP
export const verifyOtp = (email: string, token: string) =>
  withNetworkGuard(async () => {
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
  });

// Resend OTP
export const resendOtp = (email: string) =>
  withNetworkGuard(async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });

    if (error) throw error;
  });

// Send Reset Password Link
export const sendResetPasswordLink = (email: string) =>
  withNetworkGuard(async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: getPasswordResetRedirectUri(),
    });

    if (error) throw error;
  });

export type RecoveryTokens = {
  accessToken: string;
  refreshToken: string;
};

// Parse the tokens Supabase appends to the password recovery deep link
// (champo://resetPassword#access_token=...&refresh_token=...&type=recovery).
// detectSessionInUrl is disabled on the client, so the app must consume them itself.
export const parseRecoveryTokensFromUrl = (
  url: string
): { tokens: RecoveryTokens | null; error: string | null } => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    return { tokens: null, error: errorCode };
  }
  if (params.error_description) {
    return { tokens: null, error: params.error_description };
  }

  if (params.type !== 'recovery') {
    return { tokens: null, error: 'Invalid password recovery link.' };
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    return { tokens: null, error: 'Invalid password recovery link.' };
  }

  return { tokens: { accessToken, refreshToken }, error: null };
};

// Update Password using the recovery tokens from the reset link.
// The session is established here (at submit time) rather than on screen mount,
// so the auth guard doesn't unmount the reset screen while the user is typing.
export const updatePasswordWithRecoveryTokens = (password: string, tokens: RecoveryTokens) =>
  withNetworkGuard(async () => {
    let sessionEstablished = false;

    try {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      if (sessionError) throw sessionError;
      sessionEstablished = true;

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      // End the temporary recovery session so the auth guard does not redirect
      // into the app stack while this screen is still showing feedback.
      await supabase.auth.signOut();
    } catch (error) {
      if (sessionEstablished) {
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore — local session cleanup is best-effort after a failed reset.
        }
      }

      throw error;
    }
  });

// Resend Password Reset OTP
export const resendPasswordResetOtp = (email: string) =>
  withNetworkGuard(async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: getPasswordResetRedirectUri(),
    });

    if (error) throw error;
  });
