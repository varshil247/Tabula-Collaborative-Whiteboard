import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.REACT_APP_SUPABASE_KEY

let supabaseInstance: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    if (!supabaseInstance) {
      supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
    const value = (supabaseInstance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(supabaseInstance);
    }
    return value;
  }
});