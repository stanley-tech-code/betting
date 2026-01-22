
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 1. Fetch Raw Data (Last 24 Hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [visitsRes, clicksRes, leadsRes] = await Promise.all([
        supabase.from('visits').select('*').gte('created_at', oneDayAgo),
        supabase.from('clicks').select('*').gte('created_at', oneDayAgo),
        supabase.from('leads').select('*').gte('created_at', oneDayAgo)
      ]);

      const visits = visitsRes.data || [];
      const clicks = clicksRes.data || [];
      const leads = leadsRes.data || [];

      // 2. Aggregate Data by Landing Page
      const analysis = {};

      visits.forEach(v => {
        if (!analysis[v.landing_id]) analysis[v.landing_id] = { visits: 0, clicks: 0, leads: 0 };
        analysis[v.landing_id].visits++;
      });
      clicks.forEach(c => {
        if (!analysis[c.landing_id]) analysis[c.landing_id] = { visits: 0, clicks: 0, leads: 0 };
        analysis[c.landing_id].clicks++;
      });
      leads.forEach(l => {
        if (!analysis[l.landing_id]) analysis[l.landing_id] = { visits: 0, clicks: 0, leads: 0 };
        analysis[l.landing_id].leads++;
      });

      // 3. Score & Classify
      const insights = [];

      for (const landingId in analysis) {
        const data = analysis[landingId];
        if (data.visits < 5) continue; // Skip low data

        const ctr = data.clicks / data.visits;
        const leadRate = data.leads / data.visits;

        // AI SCORING LOGIC
        // Weight: CTR (40%), LeadRate (60%) - Prioritizing Leads
        let score = (ctr * 400) + (leadRate * 600);
        if (score > 100) score = 100; // Cap at 100

        // STATUS CLASSIFICATION
        let status = "HOLD";
        let recommendation = "Gathering more data. Performance is average.";

        if (score >= 70) {
          status = "SCALE";
          recommendation = "High performance! Increasing budget is recommended. Lead flow is strong.";
        } else if (score < 40) {
          status = "PAUSE";
          recommendation = "Low engagement. Consider changing headline or creative. ROI risk.";
        }

        const insight = {
          landing_id: landingId,
          ctr: (ctr * 100).toFixed(2),
          lead_rate: (leadRate * 100).toFixed(2),
          score: Math.round(score),
          status,
          recommendation
        };

        insights.push(insight);

        // 4. Save to DB (History)
        await supabase.from('ai_insights').insert({
          landing_id: landingId,
          ctr: insight.ctr,
          lead_rate: insight.lead_rate,
          performance_score: insight.score,
          status: status,
          recommendation: recommendation,
          confidence: 85 // Static confidence for this version
        });
      }

      res.status(200).json({ success: true, insights });

    } catch (error) {
      console.error('AI Data Error:', error);
      res.status(500).json({ error: 'Failed to generate AI insights' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
