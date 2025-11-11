import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Hook to check network connectivity status
 * @returns { isConnected: boolean, isInternetReachable: boolean }
 */
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(setNetworkState);

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(setNetworkState);

    return () => {
      unsubscribe();
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
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
};

