// Lazy load supabase only on client side
let supabaseClient: any = null;

export const getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!supabaseClient) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return supabaseClient;
};
