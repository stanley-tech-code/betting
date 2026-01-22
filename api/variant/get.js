
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID required" });

    try {
      const { data, error } = await supabase
        .from('variants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return res.status(404).json({ error: 'Variant not found' });

      res.status(200).json({ variant: data });

    } catch (error) {
      console.error('Variant Get Error:', error);
      res.status(500).json({ error: 'Failed to fetch variant' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
