import type { Session, User } from '@supabase/supabase-js';
import { isAuthSessionActive, requiresEmailVerification } from '../authSession';

const createUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    email: 'user@example.com',
    app_metadata: { provider: 'email' },
    identities: [{ provider: 'email' }] as User['identities'],
    email_confirmed_at: null,
    ...overrides,
  }) as User;

const createSession = (user: User): Session =>
  ({
    user,
    access_token: 'token',
  }) as Session;

describe('authSession', () => {
  describe('isAuthSessionActive', () => {
    it('returns false when session is missing', () => {
      expect(isAuthSessionActive(null)).toBe(false);
    });

    it('requires email confirmation for email-only users', () => {
      const session = createSession(createUser());

      expect(isAuthSessionActive(session)).toBe(false);
      expect(
        isAuthSessionActive(
          createSession(
            createUser({
              email_confirmed_at: '2026-01-01T00:00:00.000Z',
            }),
          ),
        ),
      ).toBe(true);
    });

    it('allows OAuth users without email_confirmed_at', () => {
      const session = createSession(
        createUser({
          app_metadata: { provider: 'apple' },
          identities: [{ provider: 'apple' }] as User['identities'],
        }),
      );

      expect(isAuthSessionActive(session)).toBe(true);
    });
  });

  describe('requiresEmailVerification', () => {
    it('returns true for unverified email users', () => {
      expect(requiresEmailVerification(createSession(createUser()))).toBe(true);
    });

    it('returns false for verified email users', () => {
      expect(
        requiresEmailVerification(
          createSession(
            createUser({
              email_confirmed_at: '2026-01-01T00:00:00.000Z',
            }),
          ),
        ),
      ).toBe(false);
    });

    it('returns false for OAuth users', () => {
      expect(
        requiresEmailVerification(
          createSession(
            createUser({
              app_metadata: { provider: 'google' },
              identities: [{ provider: 'google' }] as User['identities'],
            }),
          ),
        ),
      ).toBe(false);
    });
  });
});
