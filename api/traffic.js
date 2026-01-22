
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { action } = req.query;

  // --- GO (SMART ROUTER) ---
  if (action === 'go') {
    if (req.method !== 'GET') return res.status(405).send("Method Not Allowed");
    try {
      const { data: variants, error } = await supabase.from('variants').select('id, weight').gt('weight', 0);
      if (error) throw error;

      if (!variants || variants.length === 0) return res.redirect(307, '/index.html');

      let totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedVariant = null;

      for (const v of variants) {
        if (random < v.weight) {
          selectedVariant = v;
          break;
        }
        random -= v.weight;
      }
      if (!selectedVariant) selectedVariant = variants[0];
      return res.redirect(307, `/index.html?v=${selectedVariant.id}`);

    } catch (e) {
      console.error('Router Error', e);
      return res.redirect(302, '/index.html');
    }
  }

  // --- MONITOR (WATCHDOG) ---
  if (action === 'monitor') {
    try {
      const { data: activeVariants } = await supabase.from('variants').select('*').gt('weight', 0);
      if (!activeVariants || activeVariants.length === 0) return res.status(200).json({ message: "No active variants." });

      const rollbacks = [];
      for (const v of activeVariants) {
        // Simulated crash check
        const crashSimulated = Math.random() < 0.05;
        if (crashSimulated) {
          await supabase.from('variants').update({ weight: 0, status: 'PAUSED_BY_WATCHDOG' }).eq('id', v.id);
          const logEntry = {
            event_type: "ROLLBACK",
            message: `Safe Rollback Triggered for ${v.variant_name || v.id}`,
            details: { reason: "CTR droppped below threshold", prev_weight: v.weight }
          };
          await supabase.from('system_logs').insert(logEntry);
          rollbacks.push(logEntry);
        }
      }
      const { data: recentLogs } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(5);

      return res.status(200).json({ success: true, rollbacks, logs: recentLogs || [] });

    } catch (e) {
      console.error('Watchdog Error', e);
      return res.status(500).json({ error: 'Watchdog failed' });
    }
  }

  return res.status(400).json({ error: "Unknown Action" });
}
