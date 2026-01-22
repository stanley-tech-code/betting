
const { createClient } = require('@supabase/supabase-js');

let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  } else {
    console.warn("Supabase credentials missing!");
  }
} catch (error) {
  console.error("Supabase Init Error:", error);
}

module.exports = async function handler(req, res) {
  if (!supabase) {
    return res.status(500).json({ error: "Configuration Error: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in Vercel. Please add them in Settings." });
  }
  const { action } = req.query;

  // --- VARIANT: PROPOSE ---
  if (action === 'propose') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    try {
      const variants = [
        { name: "Sheng Hype", headline: "Ndege Imepa! 🚀", subheadline: "Watu wanakula 100x sahii! Ingia uone.", cta: "CHEZA SASA", template: "SHENG" },
        { name: "Urgency Red", headline: "SIGNAL DETECTED: 80% WIN 🔥", subheadline: "System predicts high multiplier in 2 mins.", cta: "VIEW SIGNAL", template: "URGENCY" },
        { name: "Exclusive Club", headline: "VIP Access Only 💎", subheadline: "Join the elite winning circle.", cta: "REQUEST ACCESS", template: "VIP" }
      ];
      const v = variants[Math.floor(Math.random() * variants.length)];
      v.name = v.name + " (" + Math.floor(Math.random() * 1000) + ")";

      const { data, error } = await supabase.from('variants').insert({
        landing_id: 'LP_LOBBY',
        variant_name: v.name,
        headline: v.headline,
        subheadline: v.subheadline,
        cta_text: v.cta,
        template_type: v.template,
        status: 'PENDING'
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

  // --- VARIANT: ANALYZE (Evaluate & Suggest) ---
  if (action === 'analyze') {
    try {
      // 1. Fetch Variants
      const { data: variants } = await supabase.from('variants').select('*').neq('status', 'REJECTED');

      const variantStats = (variants || []).map(v => {
        // MOCK DATA: In prod, fetch real visits/clicks from traffic_logs or aggregated tables
        // For demonstration, we simulate "live" data.
        const vVisits = Math.floor(Math.random() * 800) + 50;
        const vLeads = Math.floor(vVisits * (Math.random() * 0.1));
        const leadRate = vVisits > 0 ? vLeads / vVisits : 0;

        let aiScore = Math.min(100, Math.round(leadRate * 1000)); // Simple Score: Lead% * 10
        if (vVisits < 100) aiScore = 50; // Neutral if low data

        let status = "TEST";
        if (aiScore >= 80) status = "SCALE";
        else if (aiScore < 30 && vVisits > 200) status = "PAUSE";

        return {
          ...v,
          visits: vVisits,
          leads: vLeads,
          leadRate: (leadRate * 100).toFixed(2),
          ai_score: aiScore,
          status_rec: status
        };
      });

      // 2. Calculate Suggested Weights (Logic: Scale gets bulk, Test gets remainder, Pause gets 0)
      const scaleCandidates = variantStats.filter(v => v.status_rec === "SCALE");
      const testCandidates = variantStats.filter(v => v.status_rec === "TEST");

      // Weight Distribution Config
      const SCALE_POOL = scaleCandidates.length > 0 ? (testCandidates.length > 0 ? 80 : 100) : 0;
      const TEST_POOL = testCandidates.length > 0 ? (scaleCandidates.length > 0 ? 20 : 100) : 0;

      const weightPerScale = scaleCandidates.length > 0 ? Math.floor(SCALE_POOL / scaleCandidates.length) : 0;
      const weightPerTest = testCandidates.length > 0 ? Math.floor(TEST_POOL / testCandidates.length) : 0;

      variantStats.forEach(v => {
        if (v.status_rec === "SCALE") v.suggested_weight = weightPerScale;
        else if (v.status_rec === "TEST") v.suggested_weight = weightPerTest;
        else v.suggested_weight = 0;

        // Also return current weight (from DB 'weight' column)
        v.current_weight = v.weight || 0;
      });

      return res.status(200).json({ success: true, stats: variantStats });

    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // --- VARIANT: APPLY (Manual Apply Button) ---
  if (action === 'apply-manual') {
    if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");
    const { id, weight, status } = req.body;

    try {
      await supabase.from('variants').update({
        weight: weight,
        status: status,
        last_updated: new Date().toISOString()
      }).eq('id', id);

      return res.status(200).json({ success: true, message: "Applied" });
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
