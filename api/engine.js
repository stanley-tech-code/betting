const fs = require('fs');
const path = require('path');

// Helper to read logs
const readLogs = () => {
  try {
    const logPath = path.join(process.cwd(), 'data', 'ai_logs.json');
    if (!fs.existsSync(logPath)) return [];
    const content = fs.readFileSync(logPath, 'utf-8');
    return content.trim().split('\n').map(l => {
      try { return JSON.parse(l); } catch (e) { return null; }
    }).filter(x => x).reverse().slice(0, 50); // Last 50 items
  } catch (e) { return []; }
};

module.exports = async function handler(req, res) {
  const { action } = req.query;

  if (action === 'analyze') {
    const logs = readLogs();

    // Transform logs into the "stats" format the dashboard expects for the table
    // Or just send raw logs if we update dashboard to use them
    // The dashboard expects: { stats: [ { id, name, ai_score, status_rec, suggested_weight, current_weight } ] }

    // For now, let's just return the logs in a way the dashboard "Feed" can use
    // We might need to hack the dashboard HTML a bit to consume this new format
    // OR we map these logs to "messages" for the feed.

    // Let's rely on the dashboard's "alerts" or "feed" section.
    // It seems dashboard.html expects `stats` array.

    return res.status(200).json({
      stats: [], // Keep table empty for now or populate from campaigns?
      logs: logs // New field for the feed
    });
  }

  return res.status(400).json({ error: "Unknown Action" });
};
