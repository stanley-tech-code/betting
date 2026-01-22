const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// Helper to hash IPs
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

module.exports = async function handler(req, res) {
  if (!supabase) return res.status(500).json({ error: "Missing Env Vars" });
  // Parsing the 'action' from query params, which we will route in vercel.json
  // e.g. /api/track/visit -> /api/track.js?action=visit
  const { action } = req.query;

  // --- VISIT ---
  if (action === 'visit') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    const { sessionId, landingId, source, country } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const hashedIp = hashIP(ip);

    try {
      await supabase.from('visits').insert({
        session_id: sessionId,
        landing_id: landingId,
        source: source || 'direct',
        country: country || 'unknown',
        ip_hash: hashedIp
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error("Visit Error", e);
      return res.status(500).json({ error: e.message });
    }
  }

  // --- CLICK ---
  if (action === 'click') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    const { sessionId, landingId } = req.body;
    try {
      await supabase.from('clicks').insert({
        session_id: sessionId,
        landing_id: landingId,
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error("Click Error", e);
      return res.status(500).json({ error: e.message });
    }
  }

  // --- LEAD ---
  if (action === 'lead') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    const { sessionId, landingId, phone } = req.body;
    try {
      // Save to DB
      await supabase.from('leads').insert({
        session_id: sessionId,
        landing_id: landingId,
        phone: phone
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error("Lead Error", e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: "Unknown Action" });
}
