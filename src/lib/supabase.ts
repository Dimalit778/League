import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL! as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY! as string;

// const local_supabase_url = process.env.EXPO_PUBLIC_LOCAL_SUPABASE_URL! as string;
// const local_supabase_anon_key = process.env.EXPO_PUBLIC_LOCAL_SUPABASE_ANON_KEY! as string;
// const local_supabase_jwt_secret = process.env.EXPO_PUBLIC_LOCAL_SUPABASE_JWT_SECRET! as string;

// Only import AsyncStorage in environments where window is defined (client-side)
let AsyncStorage: any;
if (typeof window !== 'undefined') {
  // Dynamic import to avoid SSR issues
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
