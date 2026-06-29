import type { Session, User } from '@supabase/supabase-js';

const isEmailOnlyUser = (user: User): boolean => {
  const providers = user.identities?.map((identity) => identity.provider) ?? [];

  if (providers.length === 0) {
    const provider = user.app_metadata?.provider;
    return !provider || provider === 'email';
  }

  return providers.every((provider) => provider === 'email');
};

export const isAuthSessionActive = (session: Session | null): boolean => {
  if (!session?.user?.id) return false;

  if (!isEmailOnlyUser(session.user)) {
    return true;
  }

  return !!session.user.email_confirmed_at;
};

export const requiresEmailVerification = (session: Session | null): boolean => {
  if (!session?.user?.email) return false;

  return isEmailOnlyUser(session.user) && !session.user.email_confirmed_at;
};
