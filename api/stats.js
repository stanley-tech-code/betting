const { createClient } = require('@supabase/supabase-js');

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

module.exports = async function handler(req, res) {
  if (!supabase) return res.status(500).json({ error: "Server Error: Missing Supabase Env Vars" });
  const { action } = req.query;

  // --- DASHBOARD SUMMARY ---
  if (action === 'dashboard-summary') {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [visitsRes, clicksRes, leadsRes] = await Promise.all([
        supabase.from('visits').select('*').gte('created_at', oneDayAgo),
        supabase.from('clicks').select('*').gte('created_at', oneDayAgo),
        supabase.from('leads').select('*').gte('created_at', oneDayAgo)
      ]);

      // Get real data from database
      let visits = visitsRes.data || [];
      let clicks = clicksRes.data || [];
      let leads = leadsRes.data || [];

      // Real Aggregation Logic
      const stats = {};
      // Simplification: Assume landing_id is the key
      visits.forEach(v => {
        const key = v.landing_id || 'Unknown';
        if (!stats[key]) stats[key] = { visits: 0, clicks: 0, leads: 0, ctr: 0 };
        stats[key].visits++;
      });
      clicks.forEach(c => {
        const key = c.landing_id || 'Unknown';
        if (stats[key]) stats[key].clicks++;
      });
      leads.forEach(l => {
        const key = l.landing_id || 'Unknown';
        if (stats[key]) stats[key].leads++;
      });

      // Calc CTR
      Object.keys(stats).forEach(k => {
        if (stats[k].visits > 0) stats[k].ctr = ((stats[k].clicks / stats[k].visits) * 100).toFixed(1);
      });

      return res.status(200).json({ stats });

    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- HISTORY (Line Chart) ---
  if (action === 'history') {
    // Mock History Data
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const visits = [120, 150, 180, 220, 300, 450, 500];
    return res.status(200).json({ labels, datasets: { visits } });
  }

  // --- DOWNLOAD LEADS (CSV) ---
  if (action === 'download-leads') {
    try {
      const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

      if (!leads || leads.length === 0) return res.status(200).send("No leads found.");

      const csvRows = [];
      csvRows.push("Date,Phone,Country,LandingID");
      leads.forEach(l => {
        csvRows.push(`${l.created_at},${l.phone_number},${l.country},${l.landing_id}`);
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"');
      return res.status(200).send(csvRows.join('\n'));
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  return res.status(400).json({ error: "Unknown Action" });
}
