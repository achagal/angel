// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdahgtcybqmpycdyawbf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kYWhndGN5YnFtcHljZHlhd2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4NDIwMDksImV4cCI6MjAzMjQxODAwOX0.k95CNKuDj2A6syDo-Asvk0OJS1kIFYaLK7X59cAC-o4';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;