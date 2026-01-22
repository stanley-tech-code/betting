
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { action } = req.query;

  // --- MONITOR (Rollback Logic) ---
  if (action === 'monitor') {
    try {
      // 1. Fetch all Variants
      const { data: variants } = await supabase.from('variants').select('*').gt('weight', 0);

      const alerts = [];
      if (variants && variants.length > 0) {
        for (const v of variants) {
          // MOCK CHECK: In real system, query traffic_logs for this variant
          // For demo: Randomly trigger drop
          const randomDrop = Math.random();

          if (randomDrop < 0.05) { // 5% chance of alerting
            const alert = {
              variant_id: v.id,
              ctr_drop: 0.02, // Mock 2% drop
              lead_drop: 0.05, // Mock 5% drop
              message: `Significant performance drop detected for ${v.variant_name}. CTR down 25%.`
            };

            // Log to DB
            await supabase.from('rollback_alerts').insert(alert);

            // Auto-Pause (Optional - or just alert)
            // await supabase.from('variants').update({ status: 'PAUSE', weight: 0 }).eq('id', v.id);

            alerts.push(alert);
          }
        }
      }

      // Fetch Recent Alerts
      const { data: recentAlerts } = await supabase.from('rollback_alerts').select('*').order('timestamp', { ascending: false }).limit(5);

      return res.status(200).json({
        success: true,
        alerts: recentAlerts || [],
        new_alerts: alerts
      });

    } catch (e) {
      console.error('Watchdog Error', e);
      return res.status(500).json({ error: 'Watchdog failed' });
    }
  }

  // --- GO (Smart Router - Backup) ---
  if (action === 'go') {
    if (req.method !== 'GET') return res.status(405).send("Method Not Allowed");
    try {
      const { data: variants } = await supabase.from('variants').select('id, weight').gt('weight', 0);

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
      return res.redirect(302, '/index.html');
    }
  }

  return res.status(400).json({ error: "Unknown Action" });
}
