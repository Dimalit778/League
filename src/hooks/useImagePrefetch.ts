import { useCallback, useState } from 'react';
import { Image } from 'react-native';

type PrefetchResult = {
  url: string;
  success: boolean;
  result?: boolean;
  error?: unknown;
};

/**
 * Custom hook to prefetch an array of image URLs
 */
export const useImagePrefetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<PrefetchResult[]>([]);

  /**
   * Prefetch an array of image URLs
   * @param urls Array of image URLs to prefetch
   * @returns Promise that resolves with prefetch results
   */
  const prefetchImages = useCallback(
    async (urls: string[]): Promise<PrefetchResult[]> => {
      if (!urls.length) {
        setIsComplete(true);
        setResults([]);
        return [];
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
        const prefetchResults = await Promise.all(
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

        setResults(prefetchResults);
        setIsComplete(true);
        return prefetchResults;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to prefetch images');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    prefetchImages,
    isLoading,
    isComplete,
    error,
    results,
  };
};
