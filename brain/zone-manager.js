import chalk from 'chalk';
import { PropellerClient } from './propeller-client.js';
import { DataStore } from './data-store.js';
import { Logger } from './logger.js';

export const ZoneManager = {
  run: async (campaigns) => {
    console.log(chalk.blue('   [🗺️ Zones] Analyzing traffic sources...'));

    for (const camp of campaigns) {
      const zoneStats = await PropellerClient.getZoneStats(camp.id);
      const badZones = [];

      for (const z of zoneStats) {
        // normalize metrics
        const imps = z.impressions || 0;
        const clicks = z.clicks || 0;
        const conv = z.conversions || 0;
        const cost = z.money || 0;
        const ctr = imps > 0 ? (clicks / imps) * 100 : 0;
        const epc = clicks > 0 ? (conv * 1.50) / clicks : 0; // Assume $1.50 payout
        const cr = clicks > 0 ? (conv / clicks) * 100 : 0;

        const zoneData = {
          zone_id: z.zone_id,
          impressions: imps,
          clicks: clicks,
          conversions: conv,
          cost: cost,
          avg_ctr: ctr,
          avg_epc: epc,
          quality_score: 50 // baseline
        };

        // 1. Save to DB
        await DataStore.updateZone(zoneData);
        await DataStore.recordPerf({
          creative_id: camp.id.toString(),
          zone_id: z.zone_id,
          ...zoneData
        });

        // 2. RULES ENGINE

        // BLOCK: CTR < 0.2% after 5k imps
        if (imps > 5000 && ctr < 0.2) {
          badZones.push(z.zone_id);
          logBlock(z.zone_id, `Low CTR (${ctr.toFixed(2)}%)`);
        }

        // BLOCK: Zero conversions after 500 clicks
        else if (clicks > 500 && conv === 0) {
          badZones.push(z.zone_id);
          logBlock(z.zone_id, `Zero Conv after ${clicks} clicks (Money Bleed)`);
        }

        // BLOCK: Bot Behavior (CTR > 5% but 0 conv)
        else if (imps > 100 && ctr > 5.0 && conv === 0) {
          badZones.push(z.zone_id);
          logBlock(z.zone_id, `BOT Pattern: ${ctr.toFixed(1)}% CTR with 0 results`);
        }

        // WHITELIST: EPC > $0.03 & CR > 0.5%
        else if (epc > 0.03 && cr > 0.5) {
          Logger.log('WHITELIST', `Zone ${z.zone_id} is GOLD! EPC: $${epc.toFixed(2)}`);
          // In real impl: Add to specific Whitelist Campaign
          // await PropellerClient.addToWhitelist(z.zone_id);
        }

        // OPTIMIZE: High EPC -> Bid Up
        else if (epc > 0.04) {
          Logger.log('BID_UP', `Boosting Zone ${z.zone_id} by 15%`);
          // await PropellerClient.setZoneBid(camp.id, z.zone_id, currentBid * 1.15);
        }
      }

      // Execute Batch Blocks
      if (badZones.length > 0) {
        await PropellerClient.blockZone(camp.id, badZones);
      }
    }
  }
};

async function logBlock(zoneId, reason) {
  Logger.log('BLOCK', `Zone ${zoneId} blocked: ${reason}`);
  await DataStore.updateZone({ zone_id: zoneId, status: 'blocked' });
}
