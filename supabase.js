import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://oqllnyyoktxjdemyxtpb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CcLk4Iky6KwB7s32bSebNw_wLh2mYxZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
