const { createClient } = require('@supabase/supabase-js');

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

module.exports = async function handler(req, res) {
  if (!supabase) return res.status(500).json({ error: "Server Error: Missing Supabase Env Vars" });
  const { action } = req.query;

  // --- DASHBOARD SUMMARY (Daily Reset & Growth) ---
  if (action === 'dashboard-summary') {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

      // Parallel Queries for Today vs Yesterday
      const [todayVisits, prevVisits, todayClicks, prevClicks] = await Promise.all([
        supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStart).lt('created_at', todayStart),
        supabase.from('clicks').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('clicks').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayStart).lt('created_at', todayStart)
      ]);

      const tVisits = todayVisits.count || 0;
      const yVisits = prevVisits.count || 0;
      const tClicks = todayClicks.count || 0;
      const yClicks = prevClicks.count || 0;

      // Calc Growth %
      const calcGrowth = (curr, prev) => {
        if (prev === 0) return curr > 0 ? '+100%' : '0%';
        const p = ((curr - prev) / prev) * 100;
        return (p > 0 ? '+' : '') + p.toFixed(1) + '%';
      };

      const ctr = tVisits > 0 ? ((tClicks / tVisits) * 100).toFixed(1) : '0';

      return res.status(200).json({
        today: { visits: tVisits, clicks: tClicks, ctr: ctr + '%' },
        growth: { visits: calcGrowth(tVisits, yVisits), clicks: calcGrowth(tClicks, yClicks) }
      });

    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- HISTORY (Real 7-Day Trend) ---
  if (action === 'history') {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch raw visits for last 7 days (Optimization: select created_at only)
      const { data: rawVisits, error } = await supabase
        .from('visits')
        .select('created_at')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Aggregation Bucket
      const dailyMap = {};
      const labels = [];
      const dataPoints = [];

      // Initialize last 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
        dailyMap[dateKey] = 0;
      }

      // Fill Buckets
      (rawVisits || []).forEach(v => {
        const dateKey = v.created_at.split('T')[0];
        if (dailyMap[dateKey] !== undefined) dailyMap[dateKey]++;
      });

      // Format for Chart
      Object.keys(dailyMap).sort().forEach(dateKey => {
        // localized short date (e.g. "Jan 29")
        const dateDate = new Date(dateKey);
        labels.push(dateDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        dataPoints.push(dailyMap[dateKey]);
      });

      return res.status(200).json({ labels, datasets: { visits: dataPoints } });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- RECENT LEADS (JSON) ---
  if (action === 'get-recent-leads') {
    try {
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Show last 50
      return res.status(200).json({ leads: leads || [] });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }

  // --- DOWNLOAD LEADS (CSV) ---
  if (action === 'download-leads') {
    try {
      const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

      if (!leads || leads.length === 0) return res.status(200).send("No leads found.");

      const csvRows = [];
      csvRows.push("Date,Phone,Country,LandingID");
      leads.forEach(l => {
        // Fix: Use correct column 'phone'
        csvRows.push(`${l.created_at},${l.phone},${l.country},${l.landing_id}`);
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"');
      return res.status(200).send(csvRows.join('\n'));
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  return res.status(400).json({ error: "Unknown Action" });
}
