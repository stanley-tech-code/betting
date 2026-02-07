import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR); } catch (e) { }
}

const FILES = {
  creatives: path.join(DATA_DIR, 'creatives.json'),
  zones: path.join(DATA_DIR, 'zones.json'),
  performance: path.join(DATA_DIR, 'performance.json')
};

// Helper: Read JSON
const read = (file) => {
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) { return []; }
};

// Helper: Write JSON
const write = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) { console.error("DataStore Write Error", e); }
};

export const DataStore = {
  // --- CREATIVES ---
  getCreatives: () => read(FILES.creatives),

  saveCreative: (creative) => {
    const list = read(FILES.creatives);
    const idx = list.findIndex(c => c.creative_id === creative.creative_id);

    const entry = {
      creative_id: creative.creative_id, // PK
      campaign_id: creative.campaign_id,
      title: creative.title || '',
      description: creative.description || '',
      emoji_set: creative.emoji_set || '',
      language: creative.language || 'english', // sheng, swahili, english
      angle: creative.angle || 'generic', // fomo, bonus, curiosity
      status: creative.status || 'active',

      // Metrics
      ctr: creative.ctr || 0,
      epc: creative.epc || 0,
      conversion_rate: creative.conversion_rate || 0,
      total_impressions: creative.total_impressions || 0,
      total_clicks: creative.total_clicks || 0,
      total_conversions: creative.total_conversions || 0,
      total_spend: creative.total_spend || 0,

      created_at: creative.created_at || new Date(),
      last_tested_at: new Date()
    };

    if (idx > -1) {
      // Update existng (merge metrics)
      list[idx] = { ...list[idx], ...entry, created_at: list[idx].created_at };
    } else {
      list.push(entry);
    }
    write(FILES.creatives, list);
  },

  // --- ZONES ---
  getZones: () => read(FILES.zones),

  updateZone: (zone) => {
    const list = read(FILES.zones);
    const idx = list.findIndex(z => z.zone_id === zone.zone_id);

    const entry = {
      zone_id: zone.zone_id, // PK
      traffic_source: zone.traffic_source || 'propeller',

      // Metrics
      avg_ctr: zone.avg_ctr || 0,
      avg_epc: zone.avg_epc || 0,
      quality_score: zone.quality_score || 50,
      total_impressions: zone.total_impressions || 0,
      total_clicks: zone.total_clicks || 0,
      total_conversions: zone.total_conversions || 0,
      total_spend: zone.total_spend || 0,

      status: zone.status || 'allowed', // allowed, blocked, whitelisted
      blocked_at: zone.blocked_at || null,
      whitelisted_at: zone.whitelisted_at || null,

      last_seen: new Date()
    };

    if (idx > -1) {
      // Merge stats
      const existing = list[idx];
      list[idx] = {
        ...existing,
        ...entry,
        // Accumulate totals
        total_impressions: (existing.total_impressions || 0) + (zone.impressions || 0),
        total_clicks: (existing.total_clicks || 0) + (zone.clicks || 0),
        total_spend: (existing.total_spend || 0) + (zone.cost || 0),
        total_conversions: (existing.total_conversions || 0) + (zone.conversions || 0),
        created_at: existing.created_at
      };
    } else {
      list.push({ ...entry, created_at: new Date() });
    }
    write(FILES.zones, list);
  },

  // --- PERFORMANCE HISTORY (Creative x Zone) ---
  recordPerf: (data) => {
    const list = read(FILES.performance);
    list.push({
      creative_id: data.creative_id,
      zone_id: data.zone_id,
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours(),

      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      conversions: data.conversions || 0,
      spend: data.spend || 0,

      device_type: data.device_type || 'unknown'
    });

    // Rolling window of 10,000 records
    if (list.length > 10000) list.splice(0, list.length - 10000);
    write(FILES.performance, list);
  },

  getPerformance: () => read(FILES.performance)
};
