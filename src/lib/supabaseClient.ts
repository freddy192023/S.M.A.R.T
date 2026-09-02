import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tjemmhsqfltplgvglfmy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uh0FSR5VCuZ3c1Bduza22w_BEaUu1o4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
