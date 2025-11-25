import { supabase } from '@/lib/supabase';

type StorageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
};

type SignedUrlOptions = {
  bucket?: string;
  expiresIn?: number;
  transform?: StorageTransformOptions;
  cache?: boolean;
};

export const imageCache = new Map<string, string>();

export const buildCacheKey = (path: string, options?: SignedUrlOptions) => {
  const bucket = options?.bucket ?? 'avatars';
  const expiresIn = options?.expiresIn ?? 3600;
  const transform = options?.transform ? JSON.stringify(options.transform) : 'no-transform';
  return `${bucket}:${path}:${expiresIn}:${transform}`;
};

export const downloadImage = async (path: string, options?: SignedUrlOptions) => {
  if (!path) return undefined;

  const cacheKey = buildCacheKey(path, options);
  const shouldUseCache = options?.cache !== false;

  if (shouldUseCache && imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  const bucket = options?.bucket ?? 'avatars';
  const expiresIn = options?.expiresIn ?? 3600;
  const transform = options?.transform;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn, transform ? { transform: { resize: transform.resize } } : undefined);

  if (error) throw error;

  const signedUrl = data?.signedUrl;

  if (shouldUseCache && signedUrl) {
    imageCache.set(cacheKey, signedUrl);
  }

  return signedUrl;
};

export const downloadMultipleImages = async (
  paths: string[],
  options?: SignedUrlOptions
): Promise<Map<string, string | null>> => {
  if (paths.length === 0) {
    return new Map();
  }

  const bucket = options?.bucket ?? 'avatars';
  const expiresIn = options?.expiresIn ?? 60 * 60 * 24; // 1 day
  const transform = options?.transform;
  const shouldUseCache = options?.cache !== false;

  // Check cache first and separate cached vs uncached paths
  const cachedUrls = new Map<string, string | null>();
  const uncachedPaths: string[] = [];

  paths.forEach((path) => {
    if (!path) return;

    const cacheKey = buildCacheKey(path, options);
    const cached = shouldUseCache ? imageCache.get(cacheKey) : undefined;

    if (cached) {
      cachedUrls.set(path, cached);
    } else {
      uncachedPaths.push(path);
    }
  });

  // Only fetch signed URLs for uncached paths
  const fetchedUrls = new Map<string, string | null>();
  if (uncachedPaths.length > 0) {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrls(uncachedPaths, expiresIn, {
      download: false,
      transform: transform
        ? {
            width: transform.width,
            height: transform.height,
            resize: transform.resize,
            quality: transform.quality,
          }
        : undefined,
    } as any);

    if (error) throw error;

    // Store in cache and map
    data.forEach(({ path, signedUrl }) => {
      if (path) {
        const cacheKey = buildCacheKey(path, options);
        const url = signedUrl ?? null;
        fetchedUrls.set(path, url);

        if (shouldUseCache && url) {
          imageCache.set(cacheKey, url);
        }
      }
    });
  }

  // Merge cached and fetched URLs
  return new Map([...cachedUrls, ...fetchedUrls]);
};

export const invalidateImageCache = (path: string) => {
  [...imageCache.keys()].forEach((key) => {
    if (key.includes(`:${path}:`)) {
      imageCache.delete(key);
    }
  });
};
