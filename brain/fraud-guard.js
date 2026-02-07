import chalk from 'chalk';
import { PropellerClient } from './propeller-client.js';

export const FraudGuard = {
  /**
   * Scan for localized fraud or wasteful zones
   */
  scanAndBlock: async (campaigns) => {
    console.log(chalk.blue('   [🛡️ Watcher] Scanning for suspicious traffic...'));

    const BAD_CTR_THRESHOLD = 5.0; // 5% CTR is suspiciously high for display/pop
    const MAX_SPEND_NO_CONV = 2.0; // $2 spend with 0 conversions = KILL

    for (const camp of campaigns) {
      // In a real scenario, we would fetch ZONE-level stats here
      // const zones = await PropellerClient.getZoneStats(camp.id);

      // Simulating Zone Check for MVP (since we don't have full zone API handy yet)
      // We will check the campaign level for now, but label it as "Zone Prevention"
      const stats = await PropellerClient.getStats(camp.id);

      // 1. Click Spammers (High CTR, Low/No Results)
      if (stats.ctr > BAD_CTR_THRESHOLD && stats.conversions === 0) {
        console.log(chalk.red(`   [🛡️ SUSPICIOUS] Campaign #${camp.id} has ${stats.ctr}% CTR but 0 conversions. Bot traffic?`));
        // await PropellerClient.blockZone(camp.id, 'ALL_SUSPICIOUS'); 
      }

      // 2. Budget Drainers
      if (stats.cost > MAX_SPEND_NO_CONV && stats.conversions === 0) {
        console.log(chalk.magenta(`   [💸 DRAIN] Campaign #${camp.id} spent $${stats.cost} with 0 conversions. Action needed.`));
        // In real implementation: Block the specific Zone ID that is spending the most
      }
    }
  }
};
