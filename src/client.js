

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yyzpvxbnybqivrgdrbxl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5enB2eGJueWJxaXZyZ2RyYnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MTcyMDgsImV4cCI6MjA1Mzk5MzIwOH0.cRKG3OSgrVc8imQs-uCofW3d9ESjPMo0BFejH-QfXdg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
