import * as authApi from '@/features/auth/api/authApi';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

export const useAuthActions = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setIsError(false);
    setErrorMessage(null);
  }, []);

  const handleAction = useCallback(
    async <T extends any[]>(
      action: (...args: T) => Promise<{ success: boolean; error?: string }>,
      ...args: T
    ) => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      const result = await action(...args);

      if (result.success) {
        setIsLoading(false);
      } else {
        setIsError(true);
        setErrorMessage(result.error || 'An error occurred');
        setIsLoading(false);
      }

      return result;
    },
    []
  );

  const signIn = useCallback(
    (email: string, password: string) => handleAction(authApi.signIn, email, password, queryClient),
    [queryClient, handleAction]
  );

  const signUp = useCallback(
    (email: string, password: string, fullname: string) => handleAction(authApi.signUp, email, password, fullname),
    [handleAction]
  );

  const signInWithGoogle = useCallback(
    () => handleAction(authApi.signInWithGoogle),
    [handleAction]
  );

  const signOut = useCallback(
    () => handleAction(authApi.signOut, queryClient),
    [queryClient, handleAction]
  );

  const verifyOtp = useCallback(
    (email: string, token: string) => handleAction(authApi.verifyOtp, email, token),
    [handleAction]
  );

  const resendOtp = useCallback(
    (email: string) => handleAction(authApi.resendOtp, email),
    [handleAction]
  );

  const sendResetPasswordLink = useCallback(
    (email: string) => handleAction(authApi.sendResetPasswordLink, email),
    [handleAction]
  );

  const resendPasswordResetOtp = useCallback(
    (email: string) => handleAction(authApi.resendPasswordResetOtp, email),
    [handleAction]
  );

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    verifyOtp,
    resendOtp,
    sendResetPasswordLink,
    resendPasswordResetOtp,
    isLoading,
    isError,
    errorMessage,
    clearError,
  };
};

