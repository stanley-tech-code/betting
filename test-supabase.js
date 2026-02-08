
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);

  // Try to select from the table
  const { data, error } = await supabase
    .from('landing_stats')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Connection Failed or Table Missing!');
    console.error('Error details:', error.message);
    if (error.code === '42P01') {
      console.error('--> HINT: The table "landing_stats" does not exist. You need to run the SQL query in Supabase.');
    }
  } else {
    console.log('✅ Connection Successful!');
    console.log(`Table "landing_stats" exists. Current row count: ${data && data.length ? data.length : '0 (or verification count)'}`);

    // Try inserting a test record
    console.log('Attempting test insert...');
    const { error: insertError } = await supabase
      .from('landing_stats')
      .insert({
        session_id: 'test_script_verify',
        action: 'visit',
        referrer: 'test_script'
      });

    if (insertError) {
      console.error('❌ Insert Failed:', insertError.message);
    } else {
      console.log('✅ Test insert successful!');
    }
  }
}

testConnection();
