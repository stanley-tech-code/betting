
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking database tables...');

  const tables = ['propeller_daily_stats', 'conversions', 'ad_clicks', 'ai_logs'];

  for (const table of tables) {
    const { element, count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`❌ Table '${table}' ERROR: ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' exists. Count: ${count}`);
    }
  }
}

checkTables();
