import { createClient } from '@supabase/supabase-js'

// Access environment variables directly to ensure they're read correctly
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug logging during development
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing:', {
    url: supabaseUrl ? 'Found' : 'Missing',
    key: supabaseAnonKey ? 'Found' : 'Missing',
  });
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase 