const { Logger } = require('../brain/logger.js'); // Ensure this imports correctly in Vercel. 
// Actually, since we are in API route (CommonJS often default), and logger is ESM...
// We might need to handle import properly. 
// But let's assume we can import or use DataStore directly.

// Simpler: Just access DataStore directly here to avoid ESM/CJS mix issues in Vercel if possible.
// Or use dynamic import.

module.exports = async function handler(req, res) {
  const { action } = req.query;

  if (action === 'analyze') {
    try {
      // Dynamic import to handle ESM module 'DataStore'
      const { DataStore } = await import('../brain/data-store.js');
      const logs = await DataStore.getSystemLogs(20);

      return res.status(200).json({
        stats: [],
        logs: logs
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: "Unknown Action" });
};
