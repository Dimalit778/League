import { Button } from '@/components/ui';
import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import * as Sentry from '@sentry/react-native';
import { router } from 'expo-router';
import { ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  const { colors } = useThemeTokens();

  const handleGoHome = () => {
    resetErrorBoundary();
    try {
      router.replace('/');
    } catch {
      resetErrorBoundary();
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-error text-4xl mb-4">⚠️</Text>
        <Text className="text-text text-2xl font-headBold text-center mb-2">Something went wrong</Text>
        <Text className="text-muted text-base text-center mb-6">
          We encountered an unexpected error. Don't worry, your data is safe.
        </Text>

        {__DEV__ && (
          <View className="bg-surface border border-border rounded-lg p-4 mb-6 w-full">
            <Text className="text-error text-sm font-semibold mb-2">Error Details (Dev Only):</Text>
            <Text className="text-text text-xs font-mono">{error.message}</Text>
            {error.stack && (
              <Text className="text-muted text-xs font-mono mt-2">
                {error.stack.split('\n').slice(0, 5).join('\n')}
              </Text>
            )}
          </View>
        )}

        <View className="w-full gap-3">
          <Button title="Try Again" onPress={resetErrorBoundary} variant="primary" size="lg" />
          <Button title="Go Home" onPress={handleGoHome} variant="secondary" size="lg" />
        </View>
      </View>
    </SafeAreaView>
  );
};

type ErrorBoundaryProviderProps = {
  children: React.ReactNode;
};

export const ErrorBoundaryProvider = ({ children }: ErrorBoundaryProviderProps) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    if (!__DEV__) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        extra: {
          errorInfo,
        },
      });
    }

    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};
