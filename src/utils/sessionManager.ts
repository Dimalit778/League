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
      return null;
    }

    return session;
  } catch (error) {
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
      } else if (event === 'SIGNED_OUT') {
      } else if (event === 'SIGNED_IN') {
      }
  });

  return subscription;
};
