/**
 * Utility functions for handling network errors
 */

/**
 * Check if an error is a network-related error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = String(error).toLowerCase();

  const networkErrorPatterns = [
    'network request failed',
    'networkerror',
    'network error',
    'failed to fetch',
    'fetch failed',
    'no internet',
    'offline',
    'timeout',
    'connection',
    'econnrefused',
    'enotfound',
    'eai_again',
  ];

  return networkErrorPatterns.some(
    (pattern) =>
      errorMessage.includes(pattern) ||
      errorString.includes(pattern) ||
      error?.code === 'NETWORK_ERROR' ||
      error?.name === 'NetworkError'
  );
};

/**
 * Get a user-friendly error message for network errors
 */
export const getNetworkErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return 'No internet connection. Please check your network and try again.';
  }

  // Return original error message if not a network error
  return error?.message || error?.toString() || 'An unexpected error occurred';
};

/**
 * Format error for display to users
 */
export const formatErrorForUser = (error: any): string => {
  // Check for network errors first
  if (isNetworkError(error)) {
    return getNetworkErrorMessage(error);
  }

  // Check for common Supabase errors
  if (error?.message) {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (message.includes('invalid') && message.includes('credentials')) {
      return 'Invalid email or password. Please try again.';
    }

    if (message.includes('email') && message.includes('already')) {
      return 'This email is already registered. Please sign in instead.';
    }

    if (message.includes('session') && message.includes('expired')) {
      return 'Your session has expired. Please sign in again.';
    }

    // Permission errors
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'You do not have permission to perform this action.';
    }

    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
  }

  // Return original message or generic error
  return error?.message || 'An unexpected error occurred. Please try again.';
};

