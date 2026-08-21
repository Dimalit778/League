import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

export const useRefetchOnFocus = (refetch: () => unknown, enabled = true) => {
  const hasFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      if (hasFocused.current) {
        void refetch();
      } else {
        hasFocused.current = true;
      }
    }, [enabled, refetch]),
  );
};
