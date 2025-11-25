const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const getProfileImage = (path?: string | null) =>
  path ? `${SUPABASE_URL}/storage/v1/object/public/profile_images/${path}` : null;
