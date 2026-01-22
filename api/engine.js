
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { action } = req.query;

  // --- VARIANT: PROPOSE ---
  if (action === 'propose') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    try {
      const variants = [
        { name: "Sheng Hype", headline: "Ndege Imepa! 🚀", subheadline: "Watu wanakula 100x sahii! Ingia uone.", cta: "CHEZA SASA" },
        { name: "Urgency Red", headline: "SIGNAL DETECTED: 80% WIN 🔥", subheadline: "System predicts high multiplier in 2 mins.", cta: "VIEW SIGNAL" },
        { name: "Exclusive Club", headline: "VIP Access Only 💎", subheadline: "Join the elite winning circle.", cta: "REQUEST ACCESS" }
      ];
      const v = variants[Math.floor(Math.random() * variants.length)];
      v.name = v.name + " (" + Math.floor(Math.random() * 1000) + ")";

      const { data, error } = await supabase.from('variants').insert({
        landing_id: 'LP_LOBBY', variant_name: v.name, headline: v.headline, subheadline: v.subheadline, cta_text: v.cta, status: 'PENDING'
      }).select();
      if (error) throw error;
      return res.status(200).json({ success: true, variant: data[0] });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- VARIANT: LIST ---
  if (action === 'list') {
    try {
      const { data } = await supabase.from('variants').select('*').order('created_at', { ascending: false });
      return res.status(200).json({ variants: data });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- VARIANT: GET ---
  if (action === 'get') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID required" });
    try {
      const { data, error } = await supabase.from('variants').select('*').eq('id', id).single();
      if (error) return res.status(404).json({ error: 'Variant not found' });
      return res.status(200).json({ variant: data });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- VARIANT: STATUS ---
  if (action === 'status') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    const { id, status } = req.body;
    try {
      await supabase.from('variants').update({ status }).eq('id', id);
      return res.status(200).json({ success: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- VARIANT: ANALYZE (PERFORMANCE SCORES) ---
  if (action === 'analyze') {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [variantsRes] = await Promise.all([
        supabase.from('variants').select('*').neq('status', 'REJECTED')
      ]);
      const variants = variantsRes.data || [];

      const variantStats = variants.map(v => {
        // Mock Data Logic for Demo
        const vVisits = Math.floor(Math.random() * 500);
        const vLeads = Math.floor(vVisits * (Math.random() * 0.08));
        const vClicks = Math.floor(vVisits * (Math.random() * 0.15));
        const ctr = vVisits > 0 ? vClicks / vVisits : 0;
        const leadRate = vVisits > 0 ? vLeads / vVisits : 0;

        let confidenceScore = vVisits > 500 ? 1 : (vVisits > 200 ? 0.5 : 0.1);
        let score = Math.min(100, Math.round((ctr * 40 * 100) + (leadRate * 50 * 100) + (confidenceScore * 10)));

        let status = "TEST MORE";
        let insight = "Gathering data...";
        if (score >= 80 && vVisits > 200) { status = "SCALE"; insight = "Excellent performance."; }
        else if (score < 30 && vVisits > 200) { status = "PAUSE"; insight = "Underperforming."; }

        return { id: v.id, name: v.variant_name, headline: v.headline, visits: vVisits, leads: vLeads, ctr: (ctr * 100).toFixed(2), leadRate: (leadRate * 100).toFixed(2), score, status, insight };
      });

      // 2. Calculate Recommended Weights (Normalization for Manual Mode)
      let scaleCount = variantStats.filter(v => v.status === 'SCALE').length;
      let testCount = variantStats.filter(v => v.status === 'TEST MORE' || v.status === 'TEST').length;

      let totalScale = (scaleCount > 0) ? (testCount > 0 ? 80 : 100) : 0;
      let totalTest = (testCount > 0) ? (scaleCount > 0 ? 20 : 100) : 0;
      if (scaleCount === 0 && testCount === 0) { totalScale = 100; scaleCount = 1; }

      const wScale = scaleCount > 0 ? Math.floor(totalScale / scaleCount) : 0;
      const wTest = testCount > 0 ? Math.floor(totalTest / testCount) : 0;

      variantStats.forEach(v => {
        if (v.status === 'SCALE') v.suggested_weight = wScale;
        else if (v.status === 'TEST MORE' || v.status === 'TEST') v.suggested_weight = wTest;
        else v.suggested_weight = 0;
      });

      return res.status(200).json({ success: true, stats: variantStats });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- VARIANT: APPLY WEIGHTS (AUTOMATION) ---
  if (action === 'apply-weights') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    try {
      const { data: variants } = await supabase.from('variants').select('*').neq('status', 'REJECTED');
      const updates = [];

      let scaleCount = 0;
      let testCount = 0;
      const analyzed = variants.map(v => {
        // Mock Analysis Logic re-used
        const vVisits = Math.floor(Math.random() * 500);
        const vLeads = Math.floor(vVisits * (Math.random() * 0.08));
        const ctr = vVisits > 0 ? (vVisits * 0.2) / vVisits : 0;
        const leadRate = vVisits > 0 ? vLeads / vVisits : 0;
        let score = (ctr * 40 * 100) + (leadRate * 50 * 100);
        let role = "PAUSE";
        if (score >= 80) { role = "SCALE"; scaleCount++; }
        else if (score >= 30) { role = "TEST"; testCount++; }
        return { id: v.id, role };
      });

      let totalScale = (scaleCount > 0) ? (testCount > 0 ? 80 : 100) : 0;
      let totalTest = (testCount > 0) ? (scaleCount > 0 ? 20 : 100) : 0;
      if (scaleCount === 0 && testCount === 0) { totalScale = 100; scaleCount = 1; if (analyzed.length > 0) analyzed[0].role = "SCALE"; }

      const wScale = scaleCount > 0 ? Math.floor(totalScale / scaleCount) : 0;
      const wTest = testCount > 0 ? Math.floor(totalTest / testCount) : 0;

      for (const v of analyzed) {
        let newWeight = v.role === "SCALE" ? wScale : (v.role === "TEST" ? wTest : 0);
        const statusV = v.role === "SCALE" ? "SCALE" : (v.role === "TEST" ? "TEST MORE" : "PAUSE");
        await supabase.from('variants').update({ weight: newWeight, status: statusV }).eq('id', v.id);
        updates.push({ id: v.id, role: v.role, weight: newWeight });
      }
      return res.status(200).json({ success: true, updates });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- AI: FORECAST ---
  if (action === 'forecast') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    const { target, cpc } = req.body;
    const t = target || 1000;
    const c = cpc || 0.03;
    const budgetLow = (t * c).toFixed(2);
    const budgetHigh = (t * 1.5 * c).toFixed(2);
    const leadsLow = Math.floor(t * 0.02);
    const leadsHigh = Math.floor(t * 0.08);

    return res.status(200).json({
      budgetRange: `$${budgetLow} - $${budgetHigh}`,
      leadsRange: `${leadsLow} - ${leadsHigh} Leads`,
      cpcUsed: c
    });
  }

  // --- AI: ANALYZE (GENERIC) ---
  if (action === 'ai-analyze') {
    return res.status(200).json({ message: "AI Analysis Endpoint Ready" });
  }

  return res.status(400).json({ error: "Unknown Action" });
}
