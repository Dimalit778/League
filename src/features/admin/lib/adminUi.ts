export const ADMIN_CONTENT_CLASS = 'mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8';

export function formatAdminDate(value: string | null | undefined, language: 'en' | 'he') {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(language === 'he' ? 'he-IL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
