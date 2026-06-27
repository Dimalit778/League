import { supabase } from '@/lib/supabase';
import { formatErrorForUser } from '@/utils/errorFormats';



export const deleteUser = async () => {
  const { error } = await supabase.functions.invoke('delete-account');

  if (error) {
    throw new Error(formatErrorForUser(error));
  }
};