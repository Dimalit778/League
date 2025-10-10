import { useCallback, useState } from 'react';
import { Image } from 'react-native';

/**
 * Custom hook to prefetch an array of image URLs
 */
export const useImagePrefetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Prefetch an array of image URLs
   * @param urls Array of image URLs to prefetch
   * @returns Promise that resolves when all images are prefetched
   */
  const prefetchImages = useCallback(async (urls: string[]) => {
    if (!urls.length) {
      setIsComplete(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsComplete(false);

    try {
      // Filter out any null, undefined, or empty strings
      const validUrls = urls.filter(
        (url) => url && typeof url === 'string' && url.trim() !== ''
      );

      // Prefetch all images in parallel
      const results = await Promise.all(
        validUrls.map(async (url) => {
          try {
            const result = await Image.prefetch(url);
            return { url, success: true, result };
          } catch (e) {
            console.error('Failed to prefetch image:', url, e);
            return { url, success: false, error: e };
          }
        })
      );

      console.log(
        'Prefetch complete:',
        results.filter((r) => r.success).length,
        'successful'
      );
      setIsComplete(true);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to prefetch images')
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    prefetchImages,
    isLoading,
    isComplete,
    error,
  };
};
