
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sessionId, landingId, source, country } = req.body;
    // Vercel provides IP in headers
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const visitorId = hashIP(ip);

    try {
      const { error } = await supabase.from('visits').insert({
        session_id: sessionId,
        landing_id: landingId,
        visitor_id: visitorId,
        source: source || 'direct',
        country: country || 'unknown'
      });

      if (error) throw error;
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Supabase Error:', error);
      res.status(500).json({ error: 'Failed to track visit' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
