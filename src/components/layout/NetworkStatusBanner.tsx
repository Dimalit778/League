import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Text, View } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Network Status Banner Component
 * Shows a banner when device is offline
 */
export const NetworkStatusBanner = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show banner if we're definitely offline
    // Don't show on initial load (when state is null)
    if (isConnected === false || isInternetReachable === false) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [isConnected, isInternetReachable]);

  if (!showBanner) return null;

  return (
    <View className="bg-error px-4 py-2 items-center">
      <Text className="text-white text-sm font-semibold">
        No internet connection. Some features may not work.
      </Text>
    </View>
  );
};

