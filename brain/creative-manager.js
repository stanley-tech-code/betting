import chalk from 'chalk';
import { DataStore } from './data-store.js';
import { Logger } from './logger.js';
import { PropellerClient } from './propeller-client.js';
import { CreativeGenerator } from './ai-creative.js';

export const CreativeManager = {
  run: async (campaigns) => {
    console.log(chalk.magenta('   [🎨 Creative] Auditing Ad Performance...'));

    for (const camp of campaigns) {
      // Fetch stats (mocked as camp stats for now)
      const stats = await PropellerClient.getStats(camp.id);

      // 1. Sync to DataStore
      const creativeData = {
        creative_id: camp.id.toString(), // Treat camp as creative container
        campaign_id: camp.id.toString(),
        ctr: parseFloat(stats.ctr),
        epc: stats.clicks > 0 ? (stats.conversions * 1.5) / stats.clicks : 0, // Assume $1.50 payout
        total_impressions: stats.impressions,
        total_clicks: stats.clicks,
        total_spend: stats.cost,
        total_conversions: stats.conversions,
        conversion_rate: stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0
      };
      await DataStore.saveCreative(creativeData);

      // 2. Rules Engine
      await applyRules(creativeData, camp);
    }
  }
};

async function applyRules(c, camp) {
  // RULE 1: KILL (CTR < 0.3% after 3k imps)
  if (c.total_impressions > 3000 && c.ctr < 0.3) {
    Logger.log('KILL', `Creative ${c.creative_id} CTR ${c.ctr}% < 0.3%. Killing & replacing.`);
    // Stop current
    await PropellerClient.updateStatus(camp.id, 'stop');

    // Generate new variant
    const newCreative = await CreativeGenerator.generateShengCreative('fomo');
    // Launch (Simplified: in real app we'd attach to same campaign group)
    await PropellerClient.createCampaign(newCreative);
  }

  // RULE 2: SCALE (CTR > 1.2% after 2k imps)
  if (c.total_impressions > 2000 && c.ctr > 1.2) {
    Logger.log('SCALE', `Creative ${c.creative_id} is a WINNER (CTR ${c.ctr}%). Cloning variants.`);

    // Generate 3 variations
    for (let i = 0; i < 3; i++) {
      const angle = ['bonus', 'curiosity', 'insider'][i];
      const variant = await CreativeGenerator.generateShengCreative(angle);
      Logger.log('VARIANT', `Launching ${angle} variant for winner.`);
      await PropellerClient.createCampaign(variant);
    }

    // Boost budget/bid of winner
    await PropellerClient.updateBid(camp.id, 0.08); // Aggressive bid
  }

  // RULE 3: REWRITE (Good CTR > 0.8% but Low Conv < 0.1%)
  if (c.ctr > 0.8 && c.conversion_rate < 0.1 && c.total_clicks > 200) {
    Logger.log('EDIT', `Creative ${c.creative_id} gets clicks but no leads. Rewriting description.`);
    // In real API, we'd fetch current text. Mocking here:
    const improved = await CreativeGenerator.rewriteCreative("Current Title", "Current Desc", "Make it more honest/clear to improve conversion");
    // Apply Edit
    // await PropellerClient.updateCreative(camp.id, improved); // Need to impl this
  }
}
