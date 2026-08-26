import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

export const useRefetchOnFocus = (
  refetch: () => unknown,
  enabled = true,
  shouldRefetch = true,
) => {
  const hasFocused = useRef(false);
  const shouldRefetchRef = useRef(shouldRefetch);
  shouldRefetchRef.current = shouldRefetch;

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      if (hasFocused.current) {
        if (shouldRefetchRef.current) void refetch();
      } else {
        hasFocused.current = true;
      }
    }, [enabled, refetch]),
  );
};
