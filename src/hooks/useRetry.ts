import { canRetryError, getErrorInfo, getRetryDelay, type ErrorInfo } from '@/utils/errorFormats';
import { useCallback, useState } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  onRetry?: (attempt: number, error: ErrorInfo) => void;
  onMaxRetriesReached?: (error: ErrorInfo) => void;
}

/**
 * Hook for retrying operations with error handling
 */
export const useRetry = (options: UseRetryOptions = {}) => {
  const { maxRetries = 3, onRetry, onMaxRetriesReached } = options;
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(
    async <T>(operation: () => Promise<T>, error: any): Promise<T | null> => {
      const errorInfo = getErrorInfo(error);

      if (!canRetryError(error) || retryCount >= maxRetries) {
        if (retryCount >= maxRetries && onMaxRetriesReached) {
          onMaxRetriesReached(errorInfo);
        }
        return null;
      }

      setIsRetrying(true);
      const delay = getRetryDelay(error);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      setRetryCount((prev) => prev + 1);

      if (onRetry) {
        onRetry(retryCount + 1, errorInfo);
      }

      try {
        const result = await operation();
        setRetryCount(0); // Reset on success
        setIsRetrying(false);
        return result;
      } catch (retryError) {
        setIsRetrying(false);
        // Recursively retry if still within limits
        if (retryCount + 1 < maxRetries) {
          return retry(operation, retryError);
        }
        return null;
      }
    },
    [retryCount, maxRetries, onRetry, onMaxRetriesReached]
  );

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    retryCount,
    isRetrying,
    reset,
    canRetry: (error: any) => canRetryError(error) && retryCount < maxRetries,
  };
};
