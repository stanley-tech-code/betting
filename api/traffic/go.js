
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 1. Fetch Active Variants (Weight > 0)
      const { data: variants, error } = await supabase
        .from('variants')
        .select('id, weight')
        .gt('weight', 0);

      if (error) throw error;

      if (!variants || variants.length === 0) {
        // Fallback: No weights set? Send to default page (no variant)
        return res.redirect(307, '/index.html');
      }

      // 2. Weighted Random Selection
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

      // Fallback if math fails
      if (!selectedVariant) selectedVariant = variants[0];

      // 3. Redirect
      res.redirect(307, `/index.html?v=${selectedVariant.id}`);

    } catch (error) {
      console.error('Router Error:', error);
      // Fail Safe: Always send traffic to main page if error
      res.redirect(302, '/index.html');
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
