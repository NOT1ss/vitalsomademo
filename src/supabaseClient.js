import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: AsyncStorage,
  },
  realtime: {
    enabled: false,
  }
});

export default supabase;
