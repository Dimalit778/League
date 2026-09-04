import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// When the app returns to the foreground, iOS re-runs its reachability probe and
// briefly reports `isInternetReachable: false` before the HTTP check confirms
// (~1s). Wait this long before committing to "offline" so that transient blip
// never flashes the offline screen; coming back online is still instant.
const OFFLINE_CONFIRM_DELAY_MS = 2000;

/**
 * Hook to check network connectivity status
 * @returns { isConnected, isInternetReachable, isOffline (debounced), networkState }
 */
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);
  const [isOffline, setIsOffline] = useState(false);

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

  // `isInternetReachable === false` is the flaky, async-probed signal; a bare
  // `null` (probe pending) never counts as offline.
  const rawOffline = networkState?.isConnected === false || networkState?.isInternetReachable === false;

  useEffect(() => {
    if (!rawOffline) {
      // Reconnected (or first known state) — clear immediately.
      setIsOffline(false);
      return;
    }
    // Only commit to offline once the condition has held past the probe blip.
    const timeoutId = setTimeout(() => setIsOffline(true), OFFLINE_CONFIRM_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [rawOffline]);

  return {
    isConnected: networkState?.isConnected ?? true, // Default to true to avoid blocking on initial load
    isInternetReachable: networkState?.isInternetReachable ?? true,
    isOffline,
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

