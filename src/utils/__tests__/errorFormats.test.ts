import {
  isNetworkError,
  isAuthenticationError,
  isValidationError,
  isPermissionError,
  isServerError,
  getNetworkErrorMessage,
  getErrorInfo,
  formatErrorForUser,
  canRetryError,
  getRetryDelay,
} from '../errorFormats';

describe('isNetworkError', () => {
  it('returns false for null/undefined', () => {
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
  });

  it('detects network request failed', () => {
    expect(isNetworkError({ message: 'Network request failed' })).toBe(true);
  });

  it('detects timeout errors', () => {
    expect(isNetworkError({ message: 'Request timeout' })).toBe(true);
  });

  it('detects offline errors', () => {
    expect(isNetworkError({ message: 'Device is offline' })).toBe(true);
  });

  it('detects connection errors by code', () => {
    expect(isNetworkError({ code: 'NETWORK_ERROR' })).toBe(true);
  });

  it('detects by name NetworkError', () => {
    expect(isNetworkError({ name: 'NetworkError' })).toBe(true);
  });

  it('detects status 0 as network error', () => {
    expect(isNetworkError({ status: 0 })).toBe(true);
  });

  it('returns false for non-network errors', () => {
    expect(isNetworkError({ message: 'Invalid input' })).toBe(false);
  });
});

describe('isAuthenticationError', () => {
  it('returns false for null/undefined', () => {
    expect(isAuthenticationError(null)).toBe(false);
  });

  it('detects 401 status', () => {
    expect(isAuthenticationError({ status: 401 })).toBe(true);
  });

  it('detects invalid credentials message', () => {
    expect(isAuthenticationError({ message: 'Invalid credentials' })).toBe(true);
  });

  it('detects session expired', () => {
    expect(isAuthenticationError({ message: 'Session expired' })).toBe(true);
  });

  it('detects auth error codes', () => {
    expect(isAuthenticationError({ code: 'auth/invalid-credentials' })).toBe(true);
    expect(isAuthenticationError({ code: 'auth/user-not-found' })).toBe(true);
  });

  it('returns false for non-auth errors', () => {
    expect(isAuthenticationError({ message: 'Server error', status: 500 })).toBe(false);
  });
});

describe('isValidationError', () => {
  it('returns false for null/undefined', () => {
    expect(isValidationError(null)).toBe(false);
  });

  it('detects 400 status', () => {
    expect(isValidationError({ status: 400 })).toBe(true);
  });

  it('detects validation message', () => {
    expect(isValidationError({ message: 'Validation failed' })).toBe(true);
  });

  it('detects required field message', () => {
    expect(isValidationError({ message: 'Email is required' })).toBe(true);
  });
});

describe('isPermissionError', () => {
  it('returns false for null/undefined', () => {
    expect(isPermissionError(null)).toBe(false);
  });

  it('detects 403 status', () => {
    expect(isPermissionError({ status: 403 })).toBe(true);
  });

  it('detects forbidden message', () => {
    expect(isPermissionError({ message: 'Forbidden' })).toBe(true);
  });

  it('detects access denied message', () => {
    expect(isPermissionError({ message: 'Access denied' })).toBe(true);
  });
});

describe('isServerError', () => {
  it('returns false for null/undefined', () => {
    expect(isServerError(null)).toBe(false);
  });

  it('detects 500 status', () => {
    expect(isServerError({ status: 500 })).toBe(true);
  });

  it('detects 503 status', () => {
    expect(isServerError({ status: 503 })).toBe(true);
  });

  it('returns false for 4xx status', () => {
    expect(isServerError({ status: 400 })).toBe(false);
  });
});

describe('getNetworkErrorMessage', () => {
  it('returns timeout message for timeout errors', () => {
    const result = getNetworkErrorMessage({ message: 'Request timeout' });
    expect(result).toContain('timed out');
  });

  it('returns offline message for offline errors', () => {
    const result = getNetworkErrorMessage({ message: 'No internet connection' });
    expect(result).toContain('No internet');
  });

  it('returns generic connection message for other network errors', () => {
    const result = getNetworkErrorMessage({ message: 'Network request failed' });
    expect(result).toContain('Connection problem');
  });

  it('returns error message for non-network errors', () => {
    const result = getNetworkErrorMessage({ message: 'Something went wrong' });
    expect(result).toBe('Something went wrong');
  });
});

describe('getErrorInfo', () => {
  it('categorizes network errors', () => {
    const info = getErrorInfo({ message: 'Network request failed' });
    expect(info.category).toBe('network');
    expect(info.canRetry).toBe(true);
    expect(info.retryDelay).toBe(2000);
  });

  it('categorizes authentication errors', () => {
    const info = getErrorInfo({ status: 401, message: 'Unauthorized' });
    expect(info.category).toBe('authentication');
    expect(info.canRetry).toBe(true);
  });

  it('categorizes validation errors with specific codes', () => {
    const info = getErrorInfo({ status: 400, message: 'Validation error', code: 'email_address_invalid' });
    expect(info.category).toBe('validation');
    expect(info.canRetry).toBe(false);
    expect(info.message).toContain('valid email');
  });

  it('categorizes weak password validation errors', () => {
    const info = getErrorInfo({ status: 400, message: 'Validation error', code: 'weak_password' });
    expect(info.category).toBe('validation');
    expect(info.message).toContain('stronger password');
  });

  it('categorizes permission errors', () => {
    const info = getErrorInfo({ status: 403, message: 'Forbidden' });
    expect(info.category).toBe('permission');
    expect(info.canRetry).toBe(false);
  });

  it('categorizes server errors', () => {
    const info = getErrorInfo({ status: 500 });
    expect(info.category).toBe('server');
    expect(info.canRetry).toBe(true);
    expect(info.retryDelay).toBe(5000);
  });

  it('returns unknown for unrecognized errors', () => {
    const info = getErrorInfo({ message: 'Something odd happened' });
    expect(info.category).toBe('unknown');
    expect(info.canRetry).toBe(true);
  });
});

describe('formatErrorForUser', () => {
  it('returns a user-friendly message', () => {
    const msg = formatErrorForUser({ message: 'Network request failed' });
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });
});

describe('canRetryError', () => {
  it('returns true for network errors', () => {
    expect(canRetryError({ message: 'Network request failed' })).toBe(true);
  });

  it('returns false for validation errors', () => {
    expect(canRetryError({ status: 400, message: 'Validation error', code: 'email_address_invalid' })).toBe(false);
  });
});

describe('getRetryDelay', () => {
  it('returns 2000 for network errors', () => {
    expect(getRetryDelay({ message: 'Network request failed' })).toBe(2000);
  });

  it('returns 5000 for server errors', () => {
    expect(getRetryDelay({ status: 500 })).toBe(5000);
  });
});
