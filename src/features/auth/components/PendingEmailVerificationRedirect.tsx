import { requiresEmailVerification } from '@/features/auth/utils/authSession';
import { useAuthStore } from '@/store/AuthStore';
import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';

const PendingEmailVerificationRedirect = () => {
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated || !requiresEmailVerification(session)) return;
    if (pathname.includes('verify-email')) return;

    router.replace({
      pathname: '/(auth)/verify-email',
      params: { email: session!.user.email! },
    });
  }, [isAuthenticated, pathname, session]);

  return null;
};

export default PendingEmailVerificationRedirect;
