import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uqirgzhybbpuevtbcbzb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaXJnemh5YmJwdWV2dGJjYnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTQ5NTAsImV4cCI6MjA5Nzg5MDk1MH0.HBQhlIbpkL8uh2kCP_0cauOfqZMSBaLd6iiTQnL12aA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
