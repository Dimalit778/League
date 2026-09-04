import { act, renderHook } from '@testing-library/react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { AppState, type AppStateStatus } from 'react-native';
import { checkNetworkConnection, useNetworkStatus } from '../useNetworkStatus';

describe('network status after backgrounding', () => {
  const online = { isConnected: true, isInternetReachable: true } as NetInfoState;
  const offline = { isConnected: false, isInternetReachable: false } as NetInfoState;
  let onNetwork: (state: NetInfoState) => void;
  let onAppState: (state: AppStateStatus) => void;
  const removeNetwork = jest.fn();
  const removeAppState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(NetInfo.addEventListener).mockImplementation((listener) => {
      onNetwork = listener;
      listener(offline);
      return removeNetwork;
    });
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
      onAppState = listener;
      return { remove: removeAppState };
    });
    jest.mocked(NetInfo.refresh).mockImplementation(async () => {
      onNetwork(online);
      return online;
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('rechecks when returning to the foreground and replaces stale offline state', async () => {
    const { result, unmount } = renderHook(useNetworkStatus);
    expect(result.current.isConnected).toBe(false);
    await act(async () => onAppState('background'));
    expect(NetInfo.refresh).not.toHaveBeenCalled();
    await act(async () => onAppState('active'));
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(true);
    unmount();
    expect(removeNetwork).toHaveBeenCalled();
    expect(removeAppState).toHaveBeenCalled();
  });

  it('keeps the last state when the native probe fails, without an unhandled rejection', async () => {
    jest.mocked(NetInfo.refresh).mockRejectedValue(new Error('Native probe failed'));
    const { result } = renderHook(useNetworkStatus);
    await act(async () => onAppState('active'));
    expect(result.current.isConnected).toBe(false);
  });

  it.each([
    [true, null, true],
    [null, null, true],
    [false, null, false],
    [true, false, false],
  ])('connection %s and reachability %s permits a request: %s', async (isConnected, isInternetReachable, expected) => {
    jest.mocked(NetInfo.refresh).mockResolvedValue({ isConnected, isInternetReachable } as NetInfoState);
    await expect(checkNetworkConnection()).resolves.toBe(expected);
  });
});
