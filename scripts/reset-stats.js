
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetStats() {
  console.log('Resetting stats...');

  const tables = ['visits', 'clicks', 'leads', 'traffic_logs'];

  for (const table of tables) {
    // Delete all rows. 'neq' id '00000000-0000-0000-0000-000000000000' is a trick to select all if no better way, 
    // but typically delete().neq('id', '0') works or similar. 
    // Supabase JS delete needs a filter.
    // Using a filter that is always true: id is not null.

    // Note: uuid columns cannot always be compared to '0', checking for not null is safer?
    // Actually, simple way is:
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error(`Error clearing ${table}:`, error.message);
    } else {
      console.log(`Cleared ${table}.`);
    }
  }

  console.log('Stats reset complete.');
}

resetStats();
