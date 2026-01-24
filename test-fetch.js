const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function testFetch() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Leads JSON:", JSON.stringify(leads));
  }
}
testFetch();
