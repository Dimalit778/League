import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export const downloadImage = async (path: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(path);
      if (error) return reject(error);
      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        resolve(fr.result as string);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const uploadImage = async (
  localUri: string,
  memberId: string,
  leagueId: string,
  supabase: SupabaseClient<Database>
) => {
  const fileRes = await fetch(localUri);
  const arrayBuffer = await fileRes.arrayBuffer();

  const fileExt = localUri.split('.').pop()?.toLowerCase() ?? 'jpeg';
  const path = `${leagueId}/${memberId}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer);
  if (error) {
    throw error;
  } else {
    return path;
  }
};
