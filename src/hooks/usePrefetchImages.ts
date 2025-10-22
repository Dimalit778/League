import { Image as ExpoImage } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function usePrefetchImages(
  urls: (string | null | undefined)[] | null,
  timeoutMs = 10_000
) {
  const [ready, setReady] = useState(false);

  // Normalize + dedupe + stable
  const uniqueUrls = useMemo(
    () => Array.from(new Set((urls ?? []).filter(Boolean))) as string[],
    [urls]
  );

  // String signature to detect real changes
  const signature = useMemo(() => uniqueUrls.join('|'), [uniqueUrls]);
  const prevSigRef = useRef<string>('');

  useEffect(() => {
    console.log('usePrefetchImages effect:', {
      uniqueUrls,
      signature,
      prevSignature: prevSigRef.current,
    });

    // If nothing changed, keep current ready state; no flicker.
    if (prevSigRef.current === signature) {
      if (uniqueUrls.length === 0) setReady(true);
      return;
    }
    prevSigRef.current = signature;

    if (uniqueUrls.length === 0) {
      console.log('No URLs to prefetch, setting ready to true');
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);
    console.log('Starting image prefetch for', uniqueUrls.length, 'images');

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.log('Image prefetch timeout reached, setting ready to true');
        setReady(true); // safety net
      }
    }, timeoutMs);

    (async () => {
      try {
        console.log('Prefetching images...');
        await Promise.all(
          uniqueUrls.map((u) =>
            ExpoImage.prefetch(u, { cachePolicy: 'memory-disk' })
          )
        );
        console.log('All images prefetched successfully');
      } catch (err) {
        console.warn('Image prefetch warning:', err);
      } finally {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [signature, uniqueUrls, timeoutMs]);

  return ready;
}
