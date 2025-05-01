import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mfbsesgwswgtlqnqqaap.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYnNlc2d3c3dndGxxbnFxYWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMzYzNjgsImV4cCI6MjA2MTYxMjM2OH0.XzU2OPfCF5bHNWFhavzzhXFYD8v2AQTI8oK763huUVQ'
);

export default supabase;
