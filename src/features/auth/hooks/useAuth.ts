// features/auth/hooks/useAuth.ts
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/AuthStore';
import { useEffect } from 'react';

export const useAuth = () => {
  const userId = useAuthStore((s) => s.userId);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const setUserFromSupabase = useAuthStore((s) => s.setUserFromSupabase);
  const setAuthLoading = useAuthStore((s) => s.setAuthLoading);

  useEffect(() => {
    let isMounted = true;

    setAuthLoading(true);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        const user = session?.user ?? null;
        setUserFromSupabase(user);
      })
      .finally(() => {
        if (isMounted) setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      const user = session?.user ?? null;
      setUserFromSupabase(user);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setUserFromSupabase, setAuthLoading]);

  return {
    isLoggedIn: !!userId,
    isAuthLoading,
  };
};
