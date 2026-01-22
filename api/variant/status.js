
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, status } = req.body;
    try {
      const { error } = await supabase
        .from('variants')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Variant Update Error:', error);
      res.status(500).json({ error: 'Failed to update variant' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
