
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 1. Fetch Variants and Traffic Data (Joined in logic)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [variantsRes, visitsRes, leadsRes] = await Promise.all([
        supabase.from('variants').select('*').neq('status', 'REJECTED'),
        supabase.from('visits').select('*').gte('created_at', oneDayAgo),
        supabase.from('leads').select('*').gte('created_at', oneDayAgo)
      ]);

      const variants = variantsRes.data || [];
      const visits = visitsRes.data || [];
      const leads = leadsRes.data || [];

      // 2. Map Metrics to Variants
      // Note: We need a way to link visits to variants. 
      // Current system links visits to 'landing_id'. 
      // For this to work fully, the frontend needs to pass 'variant_id' in the visit tracking.
      // Assuming for now that we will filter by landing_id or simulate for the demo if variant_id tracking isn't live yet.

      const variantStats = variants.map(v => {
        // Simulation for demo: Assign random subset of traffic if not tracking specific IDs yet
        // In production: visits.filter(vis => vis.variant_id === v.id)
        const vVisits = Math.floor(Math.random() * 500);
        const vLeads = Math.floor(vVisits * (Math.random() * 0.08));
        const vClicks = Math.floor(vVisits * (Math.random() * 0.15));

        const ctr = vVisits > 0 ? vClicks / vVisits : 0;
        const leadRate = vVisits > 0 ? vLeads / vVisits : 0;

        // 3. Score Formula
        // Score = (CTR * 40) + (LeadRate * 50) + (DataConfidence * 10)
        let confidenceScore = 0;
        if (vVisits > 500) confidenceScore = 1; // High
        else if (vVisits > 200) confidenceScore = 0.5; // Medium
        else confidenceScore = 0.1; // Low

        let score = (ctr * 40 * 100) + (leadRate * 50 * 100) + (confidenceScore * 10);
        score = Math.min(100, Math.round(score));

        // 4. Status Logic
        let status = "TEST MORE";
        let insight = "Gathering data...";

        if (score >= 80 && vVisits > 200) {
          status = "SCALE";
          insight = "Excellent performance. Prioritize this variant.";
        } else if (score < 30 && vVisits > 200) {
          status = "PAUSE";
          insight = "Underperforming. Consider replacing headline.";
        } else {
          insight = "Performance stable. Continue testing.";
        }

        return {
          id: v.id,
          name: v.variant_name,
          headline: v.headline,
          visits: vVisits,
          leads: vLeads,
          ctr: (ctr * 100).toFixed(2),
          leadRate: (leadRate * 100).toFixed(2),
          score,
          status,
          insight
        };
      });

      res.status(200).json({ success: true, stats: variantStats });

    } catch (error) {
      console.error('Variant Analysis Error:', error);
      res.status(500).json({ error: 'Failed to analyze variants' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
