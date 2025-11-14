import { downloadMultipleImages } from '@/hooks/useSupabaseImages';
import { Image } from 'expo-image';

export const downloadAndPrefetchAvatars = async (avatarPaths: string[]): Promise<Map<string, string | null>> => {
  if (avatarPaths.length === 0) {
    return new Map();
  }

  const imageUrls = await downloadMultipleImages(avatarPaths, {
    bucket: 'avatars',
  });

  const validUrls = Array.from(imageUrls.values()).filter((url): url is string => url !== null);

  if (validUrls.length > 0) {
    await Promise.all(validUrls.map((url) => Image.prefetch(url, { cachePolicy: 'memory-disk' }).catch(() => {})));
  }

  return imageUrls;
};
