// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'CHANGE';
const supabaseKey = 'CHANGE';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
