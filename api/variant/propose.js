
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 1. Simulate AI Generation (In real world, call an LLM here)
      const variants = [
        {
          name: "Sheng Hype 01",
          headline: "Ndege Imepa! 🚀",
          subheadline: "Watu wanakula 100x sahii! Ingia uone.",
          cta: "CHEZA SASA"
        },
        {
          name: "Urgency Red 02",
          headline: "SIGNAL DETECTED: 80% WIN 🔥",
          subheadline: "System predicts high multiplier in 2 mins.",
          cta: "VIEW SIGNAL"
        }
      ];

      // Pick random one to simulate "new idea"
      const v = variants[Math.floor(Math.random() * variants.length)];
      v.name = v.name + " (" + Math.floor(Math.random() * 1000) + ")";

      // 2. Save to DB (Status: PENDING)
      const { data, error } = await supabase.from('variants').insert({
        landing_id: 'LP_LOBBY', // Defaulting to Landing A
        variant_name: v.name,
        headline: v.headline,
        subheadline: v.subheadline,
        cta_text: v.cta,
        status: 'PENDING'
      }).select();

      if (error) throw error;

      res.status(200).json({ success: true, variant: data[0] });

    } catch (error) {
      console.error('Variant Propose Error:', error);
      res.status(500).json({ error: 'Failed to propose variant' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
