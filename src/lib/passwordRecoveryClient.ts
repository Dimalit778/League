import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Recovery must not authenticate the main client: that would unmount the
// password form through the auth guard before updateUser completes.
export function createPasswordRecoveryClient() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Password recovery is not configured');
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'champo-password-recovery',
    },
  });
}
