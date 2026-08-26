import { useFocusEffect } from 'expo-router';
import { act, renderHook } from '@testing-library/react-native';
import { useRefetchOnFocus } from '../useRefetchOnFocus';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

describe('useRefetchOnFocus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getFocusCallback = () =>
    jest.mocked(useFocusEffect).mock.calls[0][0] as () => void;

  it('skips the first focus because the query handles its initial fetch', () => {
    const refetch = jest.fn();
    renderHook(() => useRefetchOnFocus(refetch, true, true));

    act(() => getFocusCallback()());

    expect(refetch).not.toHaveBeenCalled();
  });

  it('refetches on a later focus when the query is stale', () => {
    const refetch = jest.fn();
    renderHook(() => useRefetchOnFocus(refetch, true, true));
    const focus = getFocusCallback();

    act(() => {
      focus();
      focus();
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('does not refetch fresh data on a later focus', () => {
    const refetch = jest.fn();
    renderHook(() => useRefetchOnFocus(refetch, true, false));
    const focus = getFocusCallback();

    act(() => {
      focus();
      focus();
    });

    expect(refetch).not.toHaveBeenCalled();
  });

  it('uses the latest stale state without treating the change as a focus', () => {
    const refetch = jest.fn();
    const { rerender } = renderHook<void, { isStale: boolean }>(
      ({ isStale }) => useRefetchOnFocus(refetch, true, isStale),
      { initialProps: { isStale: false } },
    );
    const focus = getFocusCallback();

    act(() => focus());
    rerender({ isStale: true });
    expect(refetch).not.toHaveBeenCalled();

    act(() => focus());
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
