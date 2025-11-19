import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

/**
 * Session management utilities
 *
 * Note: With MMKV persistence and autoRefreshToken: true, Supabase automatically:
 * - Restores session from MMKV on app start
 * - Refreshes tokens before expiration
 * - Emits TOKEN_REFRESHED events
 */

/**
 * Get current session from Supabase
 * Supabase handles restoration from MMKV and automatic refresh
 */
export const getSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Unexpected error getting session:', error);
    return null;
  }
};

/**
 * Set up session refresh listener for logging/debugging
 * Supabase automatically refreshes tokens, this just listens to events
 */
export const setupSessionRefreshListener = () => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Session token refreshed successfully');
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
    } else if (event === 'SIGNED_IN') {
      console.log('User signed in');
    }
  });

  return subscription;
};
