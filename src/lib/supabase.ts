import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL! as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY! as string;

const local_supabase_url = process.env.EXPO_PUBLIC_LOCAL_SUPABASE_URL! as string;
const local_supabase_anon_key = process.env.EXPO_PUBLIC_LOCAL_SUPABASE_ANON_KEY! as string;
const local_supabase_jwt_secret = process.env.EXPO_PUBLIC_LOCAL_SUPABASE_JWT_SECRET! as string;

// export const supabase = createClient(local_supabase_url, local_supabase_anon_key, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
// });
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {

  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
