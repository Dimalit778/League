import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { queryPersister } from '@/lib/queryPersister';
import { usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { supabase } from '@/lib/supabase';
import { isAuthSessionActive } from '@/features/auth/utils/authSession';
import { recordPendingWebLegalAcceptance } from '@/features/auth/legalAcceptance';
import { useAuthStore } from '@/store/AuthStore';
import type { Session } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

const setSignedOut = (queryClient: QueryClient) => {
  usePrimaryLeagueStore.getState().clearPrimaryLeague();
  queryClient.clear();
  void Promise.resolve(queryPersister.removeClient()).catch(() => {
    console.error('Failed to clear persisted user cache after session ended');
  });
  useAuthStore.setState({
    user: null,
    session: null,
    isAuthenticated: false,
    isAuthLoading: false,
  });
};

const syncSessionUser = async (session: Session | null, shouldApply: () => boolean, queryClient: QueryClient) => {
  if (!session?.user?.id) {
    if (shouldApply()) {
      setSignedOut(queryClient);
    }
    return;
  }

  if (!shouldApply()) return;

  let data;
  let error;
  try {
    ({ data, error } = await supabase.from('users').select('*').eq('id', session.user.id).single());
  } catch (fetchError) {
    // Network/transient failure — keep the existing auth state
    console.error('Failed to fetch user row:', fetchError);
    if (shouldApply()) {
      useAuthStore.setState({ isAuthLoading: false });
    }
    return;
  }

  if (!shouldApply()) return;

  if (error) {
    // PGRST116 = no rows found: the user row genuinely does not exist
    if (error.code === 'PGRST116') {
      setSignedOut(queryClient);
    } else {
      // Server/transient error — keep the existing auth state
      console.error('Failed to fetch user row:', error.message);
      useAuthStore.setState({ isAuthLoading: false });
    }
    return;
  }

  if (!data) {
    setSignedOut(queryClient);
    return;
  }

  const isSessionActive = isAuthSessionActive(session);
  // Clear loading in the same update as isAuthenticated so web OAuth
  // never flashes the landing screen between session and user row.
  useAuthStore.setState({
    user: data,
    session,
    isAuthenticated: !!data.id && isSessionActive,
    isAuthLoading: false,
  });
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  // On React Native the token auto-refresh timer must be started/stopped with
  // the app foreground state, otherwise sessions silently expire in background.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    supabase.auth.startAutoRefresh();
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      appStateSubscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let authRevision = 0;
    const initialRevision = authRevision;
    const isInitialCurrent = () => isMounted && authRevision === initialRevision;

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isInitialCurrent()) return;
        if (session?.user?.id) {
          try {
            await recordPendingWebLegalAcceptance(session.user.app_metadata.provider);
          } catch (error) {
            if (!isInitialCurrent()) return;
            console.error('Failed to record legal acceptance after OAuth redirect:', error);
            await supabase.auth.signOut();
            return;
          }
        }
        await syncSessionUser(session, isInitialCurrent, queryClient);
      })
      .catch((error: unknown) => {
        if (!isInitialCurrent()) return;

        console.error('Failed to get session:', error);

        setSignedOut(queryClient);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'INITIAL_SESSION') {
        return;
      }

      const revision = ++authRevision;
      const isCurrent = () => isMounted && revision === authRevision;

      // Never await Supabase auth work here — async listeners block setSession,
      // updateUser, and signOut until they finish (e.g. password reset submit).
      void (async () => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (event === 'SIGNED_IN') {
            try {
              await recordPendingWebLegalAcceptance(session?.user.app_metadata.provider);
            } catch (error) {
              if (!isCurrent()) return;
              console.error('Failed to record legal acceptance after OAuth sign in:', error);
              await supabase.auth.signOut();
              return;
            }
          }
          await syncSessionUser(session, isCurrent, queryClient);
        } else if (event === 'SIGNED_OUT') {
          setSignedOut(queryClient);
        } else {
          useAuthStore.setState({ isAuthLoading: false });
        }
      })();
    });

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return <>{children}</>;
};

// Hook for backward compatibility - directly uses the store
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return {
    user,
    session,
    isAuthLoading,
    isLoggedIn: isAuthenticated,
  };
};
