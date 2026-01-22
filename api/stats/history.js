
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 1. Fetch Raw Data (Last 7 Days for Charts)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [visitsRes, leadsRes] = await Promise.all([
        supabase.from('visits').select('created_at').gte('created_at', sevenDaysAgo),
        supabase.from('leads').select('created_at').gte('created_at', sevenDaysAgo)
      ]);

      const visits = visitsRes.data || [];
      const leads = leadsRes.data || [];

      // 2. Aggregate by Day (Simple Format: MM-DD)
      const days = {};

      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        days[key] = { visits: 0, leads: 0 };
      }

      // Count Visits
      visits.forEach(v => {
        const date = new Date(v.created_at);
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (days[key]) days[key].visits++;
      });

      // Count Leads
      leads.forEach(l => {
        const date = new Date(l.created_at);
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (days[key]) days[key].leads++;
      });

      const labels = Object.keys(days);
      const visitData = labels.map(label => days[label].visits);
      const leadData = labels.map(label => days[label].leads);

      res.status(200).json({
        process: true,
        labels,
        datasets: {
          visits: visitData,
          leads: leadData
        }
      });

    } catch (error) {
      console.error('History API Error:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
