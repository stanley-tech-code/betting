
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sessionId, landingId, phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number required" });
    }

    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('leads').insert({
        session_id: sessionId,
        landing_id: landingId,
        phone: phone
      });

      if (error) throw error;

      // NOTE: We cannot write to local CSV files in Vercel Serverless environment.
      // The leads are safely stored in Supabase.

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Supabase Error:', error);
      res.status(500).json({ error: 'Failed to save lead' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
