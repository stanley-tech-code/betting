import { DataStore } from './data-store.js';
import { Logger } from './logger.js';

export const PatternEngine = {
  analyze: () => {
    const history = DataStore.getPerformance();

    // Group by Creative+Zone
    const map = {};
    history.forEach(h => {
      const key = `${h.creative_id}|${h.zone_id}`;
      if (!map[key]) map[key] = { cid: h.creative_id, zid: h.zone_id, clicks: 0, conv: 0, spend: 0 };
      map[key].clicks += h.clicks;
      map[key].conv += h.conversions;
      map[key].spend += h.spend;
    });

    // Find Gems
    Object.values(map).forEach(combo => {
      const epc = combo.clicks > 0 ? (combo.conv * 1.5) / combo.clicks : 0;

      // "Creative A prints on Zone B"
      if (combo.clicks > 100 && epc > 0.05) {
        Logger.log('PATTERN', `💎 GEM FOUND: Creative ${combo.cid} + Zone ${combo.zid} = $${epc.toFixed(2)} EPC`);
        // Action: We could auto-create a dedicated campaign for this pair
      }

      // "Creative B dies on Zone C"
      if (combo.clicks > 50 && combo.conv === 0 && combo.spend > 2.0) {
        Logger.log('PATTERN', `💀 MISMATCH: Creative ${combo.cid} fails on Zone ${combo.zid}. Blocking pair.`);
        // Action: Block this specific creative on this zone (if API allows) or block zone for this camp
      }
    });
  }
};
