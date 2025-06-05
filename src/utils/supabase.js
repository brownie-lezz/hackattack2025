import { createClient } from '@supabase/supabase-js'

// Access environment variables directly to ensure they're read correctly
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug logging during development
console.log('Environment variables:', {
  url: supabaseUrl,
  key: supabaseAnonKey ? 'Key exists' : 'Key missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set.'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase 