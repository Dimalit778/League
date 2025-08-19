import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Text, TouchableOpacity, View } from 'react-native';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center p-4 bg-background">
      <Text className="text-error font-bold text-lg mb-2">
        Something went wrong
      </Text>
      <Text className="text-text mb-4 text-center">{error.message}</Text>
      <TouchableOpacity
        className="bg-primary px-4 py-2 rounded-md"
        onPress={resetErrorBoundary}
      >
        <Text className="text-white font-medium">Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
      {children}
    </ReactErrorBoundary>
  );
}
