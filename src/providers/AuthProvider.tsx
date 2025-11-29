import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/AuthStore';
import { useEffect } from 'react';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    let isMounted = true;

    const currentState = useAuthStore.getState();
    const hasPersistedUser = !!currentState.user?.id;

    if (hasPersistedUser) {
      useAuthStore.setState({ isAuthLoading: false });
    }

    // Get initial session and validate
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;

        if (!session?.user?.id) {
          useAuthStore.setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isAuthLoading: false,
          });
          return;
        }

        const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (data) {
          useAuthStore.setState({
            user: data,
            session,
            isAuthenticated: !!data.id,
            isAuthLoading: false,
          });
        } else {
          useAuthStore.setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isAuthLoading: false,
          });
        }
      })
      .catch((error) => {
        console.error('Error initializing auth:', error);
        if (!isMounted) return;
        useAuthStore.setState({
          session: null,
          user: null,
          isAuthenticated: false,
          isAuthLoading: false,
        });
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user?.id) {
          const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (data) {
            useAuthStore.setState({
              session,
              user: data,
              isAuthenticated: !!data.id,
              isAuthLoading: false,
            });
          } else {
            useAuthStore.setState({
              session,
              user: null,
              isAuthenticated: false,
              isAuthLoading: false,
            });
          }
        } else {
          useAuthStore.setState({
            session,
            user: null,
            isAuthenticated: false,
            isAuthLoading: false,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({
          session: null,
          user: null,
          isAuthenticated: false,
          isAuthLoading: false,
        });
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
