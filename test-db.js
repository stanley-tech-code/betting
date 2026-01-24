const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  const uuid = crypto.randomUUID();
  console.log("Using UUID:", uuid);

  const { error } = await supabase.from('leads').insert({
    session_id: uuid,
    landing_id: 'TEST_SCRIPT',
    phone: '0700000000'
  });

  if (error) {
    console.log("ERR: " + error.message);
  } else {
    console.log("SUCCESS");
  }
}
test();
