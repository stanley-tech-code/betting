import chalk from 'chalk';
import { PropellerClient } from './propeller-client.js';
import { CreativeGenerator } from './ai-creative.js';
import { Logger } from './logger.js';
import { ZoneManager } from './zone-manager.js';
import { CreativeManager } from './creative-manager.js';
import { PatternEngine } from './pattern-engine.js';
import { BudgetManager } from './budget-manager.js';

export const DecisionEngine = {
  run: async () => {
    console.log(chalk.blue('   [🧠 Brain] Analyzing market data...'));

    // 1. Get Live Data
    const campaigns = await PropellerClient.getCampaigns();

    // Mock data if empty
    if (campaigns.length === 0) {
      console.log(chalk.gray('   [ℹ️ Info] No live campaigns found. Simulating data...'));
      campaigns.push({ id: 101, name: 'Test Camp A', status: 'working' });
      campaigns.push({ id: 102, name: 'Test Camp B', status: 'working' });
    }

    // 2. Analyze Each Campaign
    // (Legacy simple loop replaced by specialized managers)
    // But we still keep the high-level decision engine for global scale/kill

    // -> Run Intelligent Managers
    await ZoneManager.run(campaigns);
    await CreativeManager.run(campaigns);
    await BudgetManager.run(campaigns); // [NEW] Gatekeeper
    PatternEngine.analyze(); // Sync analysis of local data

    // -> Run Global Decisions (Legacy Check)
    for (const camp of campaigns) {
      const stats = await PropellerClient.getStats(camp.id);
      const MIN_CTR = Number(process.env.MinCTR) || 0.17;
      const SCALE_CTR = Number(process.env.ScaleCTR) || 1.5;

      // RULE: Kill Low CTR
      if (stats.ctr < MIN_CTR && stats.impressions > 1000) {
        // Handled by CreativeManager mostly, but double check safety net
        const msg = `Campaign #${camp.id} (CTR: ${stats.ctr}%) < ${MIN_CTR}%. Stopping.`;
        // Logger.log('KILL', msg, { campaignId: camp.id, stats });
        // await PropellerClient.updateStatus(camp.id, 'stop');
      }
    }

    // 3. Creative Refresh (If needed)
    // Simple logic: if we killed a campaign, make a new one to replace it
    // For now, we just run it randomly
    await CreativeGenerator.generateShengCreative();

    return campaigns;
  }
};
