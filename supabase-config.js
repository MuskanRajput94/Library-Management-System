// Supabase credentials — get these from your Supabase project dashboard
// Settings → API → Project URL and anon/public key
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
