import { DataStore } from './data-store.js';

export const Logger = {
  log: (type, message, details = {}) => {
    const entry = {
      type,
      message,
      details,
      timestamp: new Date().toISOString()
    };

    console.log(`[${type}] ${message}`); // Keep console for Vercel logs

    // Persist to Supabase
    DataStore.saveSystemLog(entry).catch(err => {
      console.error("Failed to save log to Supabase:", err.message);
    });
  },

  readLast: async (n = 20) => {
    return await DataStore.getSystemLogs(n);
  }
};
