import { supabase } from "@/lib/supabase";
import * as ImagePicker from 'expo-image-picker';

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const PROFILE_IMAGE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

type ProfileImageMimeType = keyof typeof PROFILE_IMAGE_EXTENSIONS;

const normalizeMimeType = (mimeType?: string | null): string | null => {
  if (!mimeType) return null;
  return mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType.toLowerCase();
};

const mimeTypeFromPath = (path: string): ProfileImageMimeType | null => {
  const extension = path.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return null;
};

const decodedBase64Size = (base64: string): number => {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.ceil((base64.length * 3) / 4) - padding;
};

export const memberImageApi = { 
    async deleteImage(memberId: string, currentPath?: string | null) {
        if (!memberId) throw new Error('No member ID available');
    
        if (currentPath) {
          const { error: storageError } = await supabase.storage.from('profile_images').remove([currentPath]);
          if (storageError) throw storageError;
        }
    
        const { data, error } = await supabase
          .from('league_members')
          .update({ avatar_url: null })
          .eq('id', memberId)
          .select()
          .single();
    
        if (error) throw error;
        return data;
      },
      async uploadImage(memberId: string, avatarUrl: ImagePicker.ImagePickerAsset) {
        if (!memberId) throw new Error('No member ID available');

        const base64 = avatarUrl.base64;
        if (!base64) throw new Error('No base64 data available');
        // Client-side pre-checks for fast feedback; the Edge Function re-validates.
        if (decodedBase64Size(base64) > MAX_PROFILE_IMAGE_BYTES) {
          throw new Error('Profile image must be 5 MB or smaller');
        }

        const normalizedMimeType = normalizeMimeType(avatarUrl.mimeType);
        const inferredMimeType = mimeTypeFromPath(avatarUrl.fileName ?? avatarUrl.uri);
        const contentType = normalizedMimeType ?? inferredMimeType;
        if (!contentType || !(contentType in PROFILE_IMAGE_EXTENSIONS)) {
          throw new Error('Profile image must be JPEG, PNG, or WebP');
        }
        const safeContentType = contentType as ProfileImageMimeType;

        // Route the upload through moderation. The function checks ownership,
        // runs SafeSearch, and only then writes to storage with the service role.
        const { data, error } = await supabase.functions.invoke('moderate-profile-image', {
          body: { memberId, base64, contentType: safeContentType },
        });

        if (error) {
          // Surface a rejection reason from the function body when present.
          const context = (error as { context?: unknown }).context;
          let responseBody: unknown;
          if (
            context &&
            typeof context === 'object' &&
            'json' in context &&
            typeof (context as { json?: unknown }).json === 'function'
          ) {
            try {
              responseBody = await (context as { json: () => Promise<unknown> }).json();
            } catch {
              // Fall back to the SDK error message when the response is not JSON.
            }
          } else if (context && typeof context === 'object' && 'body' in context) {
            responseBody = (context as { body?: unknown }).body;
          }
          const responseMessage =
            responseBody &&
            typeof responseBody === 'object' &&
            'message' in responseBody &&
            typeof (responseBody as { message?: unknown }).message === 'string'
              ? (responseBody as { message: string }).message
              : null;
          const message =
            responseMessage ?? error.message ?? 'Image upload failed';
          throw new Error(message);
        }

        if (data?.error) {
          throw new Error(data.message ?? 'This image could not be used as a profile picture');
        }

        return data?.member ?? data;
    }

}
