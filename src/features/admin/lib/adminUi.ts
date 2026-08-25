export const ADMIN_CONTENT_CLASS = 'mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8';

type AdminUserLike = { id: string; full_name?: string | null; email?: string | null };

/** Shared display name so the web and native admin user screens agree. */
export function adminUserDisplayName(user: AdminUserLike, fallback: string): string {
  return user.full_name || user.email || fallback;
}

/** Shared user search predicate (name + email + id) for both admin platforms. */
export function filterAdminUsers<T extends AdminUserLike>(users: T[], query: string): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return users;
  return users.filter((user) =>
    `${user.full_name ?? ''} ${user.email ?? ''} ${user.id}`.toLowerCase().includes(normalized),
  );
}

export function formatAdminDate(value: string | null | undefined, language: 'en' | 'he') {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(language === 'he' ? 'he-IL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
