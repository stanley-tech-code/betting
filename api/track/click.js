
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sessionId, landingId } = req.body;

    try {
      const { error } = await supabase.from('clicks').insert({
        session_id: sessionId,
        landing_id: landingId
      });

      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Supabase Error:', error);
      res.status(500).json({ error: 'Failed to track click' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
