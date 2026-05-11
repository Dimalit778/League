import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/AuthStore';
import type { Session } from '@supabase/supabase-js';
import { useEffect } from 'react';

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

  const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();

  if (!shouldApply()) return;

  if (!data) {
    setSignedOut();
    return;
  }

  const isEmailConfirmed = !!session.user.email_confirmed_at;
  useAuthStore.setState({
    user: data,
    session,
    isAuthenticated: !!data.id && isEmailConfirmed,
    isAuthLoading: false,
  });
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;
        await syncSessionUser(session, () => isMounted);
      })
      .catch(() => {
        if (!isMounted) return;
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
