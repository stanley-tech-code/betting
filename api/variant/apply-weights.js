
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 1. Get Analysis
      // (Re-using logic from analyze.js conceptually, but fetching fresh here for safety)
      // For simplicity in this demo, we will rely on a new "calc" or just mock the logic 
      // based on the assumption that analysis runs frequently.
      // Ideally, we'd call the analyze function, but let's do a direct calculation here to be self-contained.

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [variantsRes, visitsRes, leadsRes] = await Promise.all([
        supabase.from('variants').select('*').neq('status', 'REJECTED'),
        supabase.from('visits').select('*').gte('created_at', oneDayAgo),
        supabase.from('leads').select('*').gte('created_at', oneDayAgo)
      ]);

      const variants = variantsRes.data || [];
      const visits = visitsRes.data || [];
      const leads = leadsRes.data || [];

      const updates = [];
      let scaleCount = 0;
      let testCount = 0;

      // 2. Analyze & Assign Roles
      const analyzed = variants.map(v => {
        // Simulation logic akin to analyze.js
        const vVisits = Math.floor(Math.random() * 500); // MOCK DATA FOR DEMO
        const vLeads = Math.floor(vVisits * (Math.random() * 0.08));
        const ctr = vVisits > 0 ? (vVisits * 0.2) / vVisits : 0;
        const leadRate = vVisits > 0 ? vLeads / vVisits : 0;

        let score = (ctr * 40 * 100) + (leadRate * 50 * 100);

        let role = "PAUSE";
        if (score >= 80) { role = "SCALE"; scaleCount++; }
        else if (score >= 30) { role = "TEST"; testCount++; }

        return { id: v.id, role };
      });

      // 3. Distribute 100% Weight
      // Simple Logic: 80% to SCALE group, 20% to TEST group.
      // If no SCALE, 100% to TEST.
      // If no TEST, 100% to SCALE.
      // If neither, fallback to equal distribution.

      let totalScaleWeight = 0;
      let totalTestWeight = 0;

      if (scaleCount > 0 && testCount > 0) {
        totalScaleWeight = 80;
        totalTestWeight = 20;
      } else if (scaleCount > 0) {
        totalScaleWeight = 100;
      } else if (testCount > 0) {
        totalTestWeight = 100;
      } else {
        // Fallback: Give everyone equal small weight (or 0 if effectively paused)
        // For safety, let's just make the first one active
        if (analyzed.length > 0) analyzed[0].role = "SCALE";
        totalScaleWeight = 100;
        scaleCount = 1;
      }

      const weightPerScale = scaleCount > 0 ? Math.floor(totalScaleWeight / scaleCount) : 0;
      const weightPerTest = testCount > 0 ? Math.floor(totalTestWeight / testCount) : 0;

      // 4. Apply Updates
      for (const v of analyzed) {
        let newWeight = 0;
        if (v.role === "SCALE") newWeight = weightPerScale;
        if (v.role === "TEST") newWeight = weightPerTest;

        await supabase.from('variants').update({ weight: newWeight }).eq('id', v.id);
        updates.push({ id: v.id, role: v.role, weight: newWeight });
      }

      res.status(200).json({ success: true, updates });

    } catch (error) {
      console.error('Apply Weights Error:', error);
      res.status(500).json({ error: 'Failed to apply weights' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
