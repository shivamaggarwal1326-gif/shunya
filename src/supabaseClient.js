import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://njqdxttcqsasjrwrrtjj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcWR4dHRjcXNhc2pyd3JydGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTA2NjQsImV4cCI6MjA4OTA2NjY2NH0.m2su2Lxe2WAPCFUHiu1pD1IcSfAC8wxV1QsXYPCvFSM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
