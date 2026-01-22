
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET' || req.method === 'POST') {
    try {
      // 1. Fetch Active Variants (Weight > 0)
      const { data: activeVariants, error } = await supabase
        .from('variants')
        .select('*')
        .gt('weight', 0);

      if (error) throw error;

      if (!activeVariants || activeVariants.length === 0) {
        return res.status(200).json({ message: "No active variants to monitor." });
      }

      const rollbacks = [];

      // 2. Check Performance (Watchdog Loop)
      for (const v of activeVariants) {
        // Simulation: Randomly decide if performace "CRASHED" for demo purposes
        // In real life: Query visits table, calculate real CTR drop vs last hour.

        // Let's say 5% chance of crash for demo visualization
        const crashSimulated = Math.random() < 0.05;

        if (crashSimulated) {
          // 3. EXECUTE ROLLBACK
          await supabase.from('variants').update({ weight: 0, status: 'PAUSED_BY_WATCHDOG' }).eq('id', v.id);

          // 4. LOG EVENT
          const logEntry = {
            event_type: "ROLLBACK",
            message: `Safe Rollback Triggered for ${v.variant_name || v.id}`,
            details: { reason: "CTR droppped below 0.5% Threshold", prev_weight: v.weight }
          };

          await supabase.from('system_logs').insert(logEntry);
          rollbacks.push(logEntry);
        }
      }

      // 5. Return Status
      // Also fetch recent logs to show in response
      const { data: recentLogs } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(5);

      res.status(200).json({
        success: true,
        checked: activeVariants.length,
        rollbacks: rollbacks,
        logs: recentLogs || []
      });

    } catch (error) {
      console.error('Watchdog Error:', error);
      res.status(500).json({ error: 'Watchdog failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
