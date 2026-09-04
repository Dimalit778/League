import { checkNetworkConnection } from '@/hooks/useNetworkStatus';
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  type LegalAcceptanceContext,
} from '@/features/auth/legalAcceptance';
import { clearPushToken } from '@/lib/notifications/pushToken';
import { KEYS } from '@/lib/queryClient';
import { queryPersister } from '@/lib/queryPersister';
import { supabase } from '@/lib/supabase';
import { createPasswordRecoveryClient } from '@/lib/passwordRecoveryClient';
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
export const signUp = (
  email: string,
  password: string,
  acceptance: LegalAcceptanceContext,
) =>
  withNetworkGuard(async () => {
    if (
      acceptance.accepted !== true ||
      acceptance.source !== 'email' ||
      acceptance.authFlow !== 'sign_up' ||
      acceptance.termsVersion !== CURRENT_TERMS_VERSION ||
      acceptance.privacyVersion !== CURRENT_PRIVACY_VERSION
    ) {
      throw new Error('You must accept the current Terms of Service and acknowledge the Privacy Policy.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        // No full_name is sent: handle_new_user() falls back to the email prefix.
        data: {
          provider: 'email',
          legal_accepted: true,
          legal_age_confirmed: true,
          legal_terms_version: acceptance.termsVersion,
          legal_privacy_version: acceptance.privacyVersion,
          legal_locale: acceptance.locale,
          legal_app_version: acceptance.appVersion,
        },
      },
    });

    if (error) throw error;

    if (data.user && data.user.identities?.length === 0) {
      throw new Error('Email already registered');
    }
  });

// Sign Out
export const signOut = async (queryClient: QueryClient) => {
  // Clear the push token WHILE the session is still valid — RLS
  // (auth.uid() = id) blocks this update once the session is gone, so it
  // must run before supabase.auth.signOut() below. Best-effort: a clear
  // failure must never block sign-out.
  try {
    await clearPushToken();
  } catch {
    // clearPushToken already swallows its own errors, but guard regardless.
  }

  // Supabase retains its local session when the logout request fails (for
  // example, offline). Report that failure instead of clearing the UI while
  // leaving credentials that silently restore the account on the next launch.
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: formatErrorForUser(error) };
  } catch (error) {
    return { success: false, error: formatErrorForUser(error) };
  }

  usePrimaryLeagueStore.getState().clearPrimaryLeague();

  // Drop all cached server data so the next user on this device starts fresh.
  // clear() empties the in-memory cache; removeClient() deletes the on-disk
  // MMKV snapshot so the next user can't hydrate the previous user's leagues.
  queryClient.clear();
  await queryPersister.removeClient();

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
    const recoveryClient = createPasswordRecoveryClient();
    let sessionEstablished = false;

    try {
      const { error: sessionError } = await recoveryClient.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      if (sessionError) throw sessionError;
      sessionEstablished = true;

      const { error } = await recoveryClient.auth.updateUser({ password });

      if (error) throw error;

      // End the temporary recovery session so the auth guard does not redirect
      // into the app stack while this screen is still showing feedback.
      await recoveryClient.auth.signOut();
    } catch (error) {
      if (sessionEstablished) {
        try {
          await recoveryClient.auth.signOut();
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
