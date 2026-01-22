
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const csvHeader = "Timestamp,Phone,LandingID,SessionID\n";
      const csvRows = leads.map(l =>
        `"${new Date(l.timestamp).toISOString()}","${l.phone}","${l.landing_id}","${l.session_id}"`
      ).join("\n");

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="all_leads_history.csv"');
      res.status(200).send(csvContent);

    } catch (error) {
      console.error('Download Error:', error);
      res.status(500).json({ error: 'Failed to download leads' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
