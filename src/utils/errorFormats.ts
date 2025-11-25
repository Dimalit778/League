export type ErrorCategory = 'network' | 'authentication' | 'validation' | 'permission' | 'server' | 'unknown';

export interface ErrorInfo {
  category: ErrorCategory;
  message: string;
  canRetry: boolean;
  retryDelay?: number; // milliseconds
}

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = String(error).toLowerCase();
  const errorCode = error?.code?.toLowerCase() || '';

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
    'econnreset',
    'etimedout',
    'ehostunreach',
    'enoconn',
  ];

  return (
    networkErrorPatterns.some(
      (pattern) => errorMessage.includes(pattern) || errorString.includes(pattern) || errorCode.includes(pattern)
    ) ||
    error?.code === 'NETWORK_ERROR' ||
    error?.name === 'NetworkError' ||
    error?.status === 0 // Network errors often have status 0
  );
};

export const isAuthenticationError = (error: any): boolean => {
  if (!error) return false;

  const message = error.message?.toLowerCase() || '';
  const status = error?.status || error?.statusCode;

  return (
    status === 401 ||
    message.includes('unauthorized') ||
    message.includes('invalid credentials') ||
    message.includes('invalid email') ||
    message.includes('invalid password') ||
    message.includes('session expired') ||
    message.includes('token expired') ||
    message.includes('authentication') ||
    error?.code === 'auth/invalid-credentials' ||
    error?.code === 'auth/user-not-found' ||
    error?.code === 'auth/wrong-password'
  );
};

export const isValidationError = (error: any): boolean => {
  if (!error) return false;

  const message = error.message?.toLowerCase() || '';
  const status = error?.status || error?.statusCode;

  return (
    status === 400 ||
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('format') ||
    error?.code?.includes('validation')
  );
};

export const isPermissionError = (error: any): boolean => {
  if (!error) return false;

  const message = error.message?.toLowerCase() || '';
  const status = error?.status || error?.statusCode;

  return (
    status === 403 ||
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('access denied') ||
    message.includes('not authorized')
  );
};

export const isServerError = (error: any): boolean => {
  if (!error) return false;

  const status = error?.status || error?.statusCode;
  return status >= 500 && status < 600;
};

export const getNetworkErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }

    if (message.includes('offline') || message.includes('no internet')) {
      return 'No internet connection. Please check your network settings and try again.';
    }

    return 'Connection problem. Please check your internet connection and try again.';
  }

  return error?.message || 'An unexpected error occurred';
};

export const getErrorInfo = (error: any): ErrorInfo => {
  if (isNetworkError(error)) {
    return {
      category: 'network',
      message: getNetworkErrorMessage(error),
      canRetry: true,
      retryDelay: 2000, // 2 seconds for network errors
    };
  }

  if (isAuthenticationError(error)) {
    const message = error.message?.toLowerCase() || '';

    let userMessage = 'Authentication failed. Please try again.';
    if (message.includes('invalid') && (message.includes('email') || message.includes('password'))) {
      userMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (message.includes('session expired') || message.includes('token expired')) {
      userMessage = 'Your session has expired. Please sign in again.';
    } else if (message.includes('user not found')) {
      userMessage = 'No account found with this email. Please sign up instead.';
    } else if (message.includes('email already in use')) {
      userMessage = 'Email already in use. Please use a different email.';
    }

    return {
      category: 'authentication',
      message: userMessage,
      canRetry: true,
      retryDelay: 1000,
    };
  }

  if (isValidationError(error)) {
    console.log('error validation ------->,', JSON.stringify(error));
    
    // Handle specific Supabase auth error codes
    const errorCode = error?.code || '';
    
    if (errorCode === 'email_address_invalid') {
      return {
        category: 'validation',
        message: 'Please enter a valid email address.',
        canRetry: false,
      };
    }
    
    if (errorCode === 'signup_disabled') {
      return {
        category: 'validation',
        message: 'Sign up is currently disabled. Please contact support.',
        canRetry: false,
      };
    }
    
    if (errorCode === 'weak_password') {
      return {
        category: 'validation',
        message: 'Password is too weak. Please use a stronger password.',
        canRetry: false,
      };
    }
    
    const message = error.message || 'Please check your input and try again.';
    return {
      category: 'validation',
      message: message.charAt(0).toUpperCase() + message.slice(1),
      canRetry: false,
    };
  }

  if (isPermissionError(error)) {
    return {
      category: 'permission',
      message:
        'You do not have permission to perform this action. Please contact support if you believe this is an error.',
      canRetry: false,
    };
  }

  if (isServerError(error)) {
    return {
      category: 'server',
      message: 'Server error. Our team has been notified. Please try again in a few moments.',
      canRetry: true,
      retryDelay: 5000, // 5 seconds for server errors
    };
  }

  return {
    category: 'unknown',
    message: error?.message || 'An unexpected error occurred. Please try again.',
    canRetry: true,
    retryDelay: 2000,
  };
};

export const formatErrorForUser = (error: any): string => {
  return getErrorInfo(error).message;
};

export const canRetryError = (error: any): boolean => {
  return getErrorInfo(error).canRetry;
};

export const getRetryDelay = (error: any): number => {
  return getErrorInfo(error).retryDelay || 2000;
};
