import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Hook to check network connectivity status
 * @returns { isConnected: boolean, isInternetReachable: boolean }
 */
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    let mounted = true;
    // The subscription supplies the initial state too, avoiding an older
    // fetch result overwriting a newer connectivity event.
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (mounted) setNetworkState(state);
    });
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // iOS may miss reachability events while the app is in the background.
        // refresh also updates the network subscription above.
        void NetInfo.refresh().catch(() => {
          // Keep the last known state; a failed probe does not prove offline.
        });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  return {
    isConnected: networkState?.isConnected ?? true, // Default to true to avoid blocking on initial load
    isInternetReachable: networkState?.isInternetReachable ?? true,
    networkState,
  };
};

/**
 * Check if device is currently online
 * @returns Promise<boolean>
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
  const state = await NetInfo.refresh();
  // Unknown reachability is not a disconnection. Let the actual request
  // determine success instead of blocking login during network detection.
  return state.isConnected !== false && state.isInternetReachable !== false;
};

