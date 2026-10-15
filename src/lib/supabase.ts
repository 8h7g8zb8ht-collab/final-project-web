import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from environment variables, or check localStorage for live runtime testing
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const storageUrl = typeof window !== 'undefined' ? localStorage.getItem('AIRY_SUPABASE_URL') || '' : '';
const storageKey = typeof window !== 'undefined' ? localStorage.getItem('AIRY_SUPABASE_KEY') || '' : '';

export const supabaseUrl = envUrl || storageUrl;
export const supabasePublishableKey = envKey || storageKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.trim().length > 0 &&
  supabasePublishableKey &&
  supabasePublishableKey.trim().length > 0 &&
  !supabaseUrl.includes('your-project')
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export const supabase = supabaseInstance;

export function updateSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('AIRY_SUPABASE_URL', url.trim());
      localStorage.setItem('AIRY_SUPABASE_KEY', key.trim());
    } else {
      localStorage.removeItem('AIRY_SUPABASE_URL');
      localStorage.removeItem('AIRY_SUPABASE_KEY');
    }
    window.location.reload();
  }
}
