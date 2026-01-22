
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Run queries in parallel
      const [visitsRes, clicksRes, leadsRes] = await Promise.all([
        supabase.from('visits').select('*'),
        supabase.from('clicks').select('*'),
        supabase.from('leads').select('*').order('timestamp', { ascending: false })
      ]);

      if (visitsRes.error) throw visitsRes.error;
      if (clicksRes.error) throw clicksRes.error;
      if (leadsRes.error) throw leadsRes.error;

      const visits = visitsRes.data || [];
      const clicks = clicksRes.data || [];
      const leads = leadsRes.data || [];

      // Calculate Stats
      const stats = {};

      visits.forEach(v => {
        if (!stats[v.landing_id]) stats[v.landing_id] = { visits: 0, clicks: 0, leads: 0 };
        stats[v.landing_id].visits++;
      });

      clicks.forEach(c => {
        if (!stats[c.landing_id]) stats[c.landing_id] = { visits: 0, clicks: 0, leads: 0 };
        stats[c.landing_id].clicks++;
      });

      leads.forEach(l => {
        if (!stats[l.landing_id]) stats[l.landing_id] = { visits: 0, clicks: 0, leads: 0 };
        stats[l.landing_id].leads++;
      });

      // Calculate CTR
      Object.keys(stats).forEach(key => {
        const s = stats[key];
        s.ctr = s.visits > 0 ? ((s.clicks / s.visits) * 100).toFixed(2) : "0.00";
        s.conversion = s.visits > 0 ? ((s.leads / s.visits) * 100).toFixed(2) : "0.00";
      });

      // Prepare Last 50 Leads
      const recentLeads = leads.slice(0, 50).map(l => ({
        time: new Date(l.timestamp).toLocaleString(),
        phone: l.phone,
        page: l.landing_id
      }));

      res.status(200).json({ stats, recentLeads });

    } catch (error) {
      console.error('Stats Error:', error);
      res.status(500).json({ error: 'Failed to fetch usage stats' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
