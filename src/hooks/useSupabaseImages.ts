import { supabase } from '@/lib/supabase';

type StorageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
};

type SignedUrlOptions = {
  bucket?: string;
  expiresIn?: number;
  transform?: StorageTransformOptions;
  cache?: boolean;
};

const imageCache = new Map<string, string>();

const buildCacheKey = (path: string, options?: SignedUrlOptions) => {
  const bucket = options?.bucket ?? 'avatars';
  const expiresIn = options?.expiresIn ?? 3600;
  const transform = options?.transform
    ? JSON.stringify(options.transform)
    : 'no-transform';
  return `${bucket}:${path}:${expiresIn}:${transform}`;
};

export const downloadImage = async (
  path: string,
  options?: SignedUrlOptions
) => {
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
    .createSignedUrl(path, expiresIn, transform ? { transform } : undefined);

  if (error) throw error;

  const signedUrl = data?.signedUrl;

  if (shouldUseCache && signedUrl) {
    imageCache.set(cacheKey, signedUrl);
  }

  return signedUrl;
};

export const invalidateImageCache = (path: string) => {
  [...imageCache.keys()].forEach((key) => {
    if (key.includes(`:${path}:`)) {
      imageCache.delete(key);
    }
  });
};
