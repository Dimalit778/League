import { supabase } from '@/lib/supabase';
import { isAuthSessionActive } from '@/features/auth/utils/authSession';
import { useAuthStore } from '@/store/AuthStore';
import type { Session } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

const setSignedOut = () => {
  useAuthStore.setState({
    user: null,
    session: null,
    isAuthenticated: false,
    isAuthLoading: false,
  });
};

const syncSessionUser = async (session: Session | null, shouldApply: () => boolean) => {
  if (!session?.user?.id) {
    if (shouldApply()) {
      setSignedOut();
    }
    return;
  }
  if (shouldApply()) {
    useAuthStore.setState({ isAuthLoading: false });
  }

  if (!shouldApply()) return;

  let data;
  let error;
  try {
    ({ data, error } = await supabase.from('users').select('*').eq('id', session.user.id).single());
  } catch (fetchError) {
    // Network/transient failure — keep the existing auth state
    console.error('Failed to fetch user row:', fetchError);
    return;
  }

  if (!shouldApply()) return;

  if (error) {
    // PGRST116 = no rows found: the user row genuinely does not exist
    if (error.code === 'PGRST116') {
      setSignedOut();
    } else {
      // Server/transient error — keep the existing auth state
      console.error('Failed to fetch user row:', error.message);
    }
    return;
  }

  if (!data) {
    setSignedOut();
    return;
  }

  const isSessionActive = isAuthSessionActive(session);
  useAuthStore.setState({
    user: data,
    session,
    isAuthenticated: !!data.id && isSessionActive,
  });
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;
        await syncSessionUser(session, () => isMounted);
      })
      .catch((error: unknown) => {
        if (!isMounted) return;

        console.error('Failed to get session:', error);

        setSignedOut();
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await syncSessionUser(session, () => isMounted);
      } else if (event === 'SIGNED_OUT') {
        setSignedOut();
      } else {
        useAuthStore.setState({ isAuthLoading: false });
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
