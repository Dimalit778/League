import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';

export const deleteUser = async () => {
  const { error } = await supabase.rpc('delete_own_account');

  if (error) {
    throw new Error(formatErrorForUser(error));
  }
};