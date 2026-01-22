
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { target = 3000, cpc = 0.03 } = req.body;

      // 1. Fetch Historical Performance (Last 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: visits } = await supabase.from('visits').select('*').gte('created_at', oneDayAgo);
      const { data: leads } = await supabase.from('leads').select('*').gte('created_at', oneDayAgo);

      const totalVisits = visits.length;
      const totalLeads = leads.length;

      // Calculate Metrics with Fallbacks
      // If no data, use industry standards (1.5% lead rate)
      const leadRate = totalVisits > 50 ? (totalLeads / totalVisits) : 0.015;
      const ctr = totalVisits > 50 ? 0.02 : 0.02; // Placeholder, usually comes from clicks

      // 2. run Forecast Math
      const estimatedBudget = target * cpc;
      const expectedLeads = Math.round(target * leadRate);

      // Range (Low/High)
      const budgetRange = `$${(estimatedBudget).toFixed(2)} - $${(estimatedBudget * 1.2).toFixed(2)}`;
      const leadsRange = `${Math.round(expectedLeads * 0.9)} - ${Math.round(expectedLeads * 1.1)}`;

      // 3. Assess Risk
      let riskLevel = "LOW";
      let recommendation = "Safe to scale.";

      if (totalVisits < 100) {
        riskLevel = "HIGH";
        recommendation = "Not enough data. Run small test ($10) first.";
      } else if (leadRate < 0.005) {
        riskLevel = "HIGH";
        recommendation = "Lead rate is very low. Improve Landing Page before scaling.";
      } else if (leadRate < 0.02) {
        riskLevel = "MEDIUM";
        recommendation = "Lead rate is average. Monitor closely.";
      } else {
        recommendation = "Excellent performance. Scale confidently.";
      }

      // 4. Save Forecast Record (for history)
      await supabase.from('ai_forecasts').insert({
        target_visits: target,
        estimated_budget: estimatedBudget,
        expected_ctr: ctr * 100,
        expected_leads: expectedLeads,
        risk_level: riskLevel,
        recommendation: recommendation
      });

      res.status(200).json({
        success: true,
        target,
        cpc,
        budgetRange,
        leadsRange,
        riskLevel,
        recommendation
      });

    } catch (error) {
      console.error('Forecast Error:', error);
      res.status(500).json({ error: 'Failed to generate forecast' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
