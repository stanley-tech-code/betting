
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('variants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json({ variants: data });

    } catch (error) {
      console.error('Variant List Error:', error);
      res.status(500).json({ error: 'Failed to fetch variants' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
