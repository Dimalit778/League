import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

export const useRefetchOnFocus = (
  refetch: () => unknown,
  enabled = true,
  shouldRefetch = true,
) => {
  const hasFocused = useRef(false);
  const shouldRefetchRef = useRef(shouldRefetch);

  useEffect(() => {
    shouldRefetchRef.current = shouldRefetch;
  });

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
