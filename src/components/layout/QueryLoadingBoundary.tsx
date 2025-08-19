import { Suspense } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ErrorBoundary } from './ErrorBoundary';

export const QueryLoadingBoundary = ({
  children,
  message = 'Loading...',
}: {
  children: React.ReactNode;
  message?: string;
}) => {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <View
            className="flex-1 items-center justify-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          >
            <View className="bg-surface p-4 rounded-lg shadow-lg">
              <ActivityIndicator size="large" color="#0000ff" />
              <Text className="text-text mt-2 font-medium">{message}</Text>
            </View>
          </View>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
