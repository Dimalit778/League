import { isNetworkError } from '@/utils/errorFormats';

const getErrorText = (error: unknown): string => {
  if (!error || typeof error !== 'object') return String(error ?? '');

  const record = error as Record<string, unknown>;
  const parts = [record.message, record.underlyingErrorMessage, record.readableErrorCode, record.code]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.toLowerCase());

  return parts.join(' ');
};

export const isRevenueCatNetworkError = (error: unknown): boolean => {
  if (isNetworkError(error)) return true;

  const text = getErrorText(error);

  return (
    text.includes('networkerror') ||
    text.includes('unable to resolve host') ||
    text.includes('api.revenuecat.com') ||
    text.includes('no address associated with hostname')
  );
};
