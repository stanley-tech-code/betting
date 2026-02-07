const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// Ensure data dir exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR); } catch (e) { }
}

const appendToLocal = (file, data) => {
  try {
    const filePath = path.join(DATA_DIR, file);
    const entry = JSON.stringify({ ...data, timestamp: new Date().toISOString() }) + '\n';
    fs.appendFileSync(filePath, entry);
    return true;
  } catch (e) {
    console.error("Local Save Error", e);
    return false;
  }
};

// Helper to hash IPs
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

module.exports = async function handler(req, res) {
  // if (!supabase) return res.status(500).json({ error: "Missing Env Vars" }); // REMOVED BLOCKER
  // Parsing the 'action' from query params, which we will route in vercel.json
  // e.g. /api/track/visit -> /api/track.js?action=visit
  const { action } = req.query;

  // --- VISIT ---
  if (action === 'visit') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    const { sessionId, landingId, source, country } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const hashedIp = hashIP(ip);

    // Local Fallback
    if (!supabase) {
      appendToLocal('visits.json', { sessionId, landingId, source, ip: hashedIp });
      return res.status(200).json({ success: true, mode: 'local' });
    }

    try {
      const { data, error } = await supabase.from('visits').insert({
        session_id: sessionId,
        landing_id: landingId,
        source: source || 'direct',
        ip_hash: hashedIp
      });

      if (error) throw error;
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

    // Local Fallback
    if (!supabase) {
      appendToLocal('clicks.json', { sessionId, landingId });
      return res.status(200).json({ success: true, mode: 'local' });
    }

    try {
      const { data, error } = await supabase.from('clicks').insert({
        session_id: sessionId,
        landing_id: landingId,
      });

      if (error) throw error;
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

    // Local Fallback
    if (!supabase) {
      appendToLocal('leads.json', { sessionId, landingId, phone });
      return res.status(200).json({ success: true, mode: 'local' });
    }

    try {
      // Save to DB
      const { data, error } = await supabase.from('leads').insert({
        session_id: sessionId,
        landing_id: landingId,
        phone: phone
      });

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error("Lead Error", e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: "Unknown Action" });
}
