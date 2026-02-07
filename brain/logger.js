import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR); } catch (e) { }
}

const LOG_FILE = path.join(DATA_DIR, 'ai_logs.json');

export const Logger = {
  log: (type, message, details = {}) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    };

    try {
      // Append as single line JSON for easy parsing later
      fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error("Logger Failed", e);
    }
  },

  // Read last N logs specifically for ES modules or API usage
  readLast: (n = 20) => {
    try {
      if (!fs.existsSync(LOG_FILE)) return [];
      const content = fs.readFileSync(LOG_FILE, 'utf-8');
      const lines = content.trim().split('\n');
      const valid = lines.map(l => {
        try { return JSON.parse(l); } catch (e) { return null; }
      }).filter(x => x);
      return valid.slice(-n).reverse(); // Newest first
    } catch (e) {
      return [];
    }
  }
};
