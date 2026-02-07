import chalk from 'chalk';
import { DataStore } from './data-store.js';
import { Logger } from './logger.js';
import { PropellerClient } from './propeller-client.js';

export const BudgetManager = {
  run: async (campaigns) => {
    console.log(chalk.blue('   [💰 Budget] Verifying performance gates...'));

    for (const camp of campaigns) {
      const stats = await PropellerClient.getStats(camp.id);
      const verifiedStats = {
        ...stats,
        ctr: parseFloat(stats.ctr),
        roi: calculateROI(stats)
      };

      // 1. CHECK FOR MANDATORY CUTS (The "Grim Reaper")
      await checkCuts(camp, verifiedStats);

      // 2. CHECK FOR BUDGET INCREASES (The "Gatekeeper")
      await checkIncrease(camp, verifiedStats);
    }
  }
};

async function checkCuts(camp, stats) {
  // TRIGGER: CTR < 1.0% (Severe Degradation)
  if (stats.impressions > 2000 && stats.ctr < 1.0) {
    Logger.log('BUDGET_CUT', `CTR ${stats.ctr}% < 1.0%. Slashed budget by 50%.`, { campaign: camp.id });
    // await PropellerClient.updateCompanyBudget(camp.id, 'decrease', 50); // Mock API call
  }

  // TRIGGER: ROI < 100% (Losing Money)
  if (stats.cost > 5.0 && stats.roi < 100) {
    Logger.log('BUDGET_CUT', `ROI ${stats.roi}% < 100%. Slashed budget by 70%.`, { campaign: camp.id });
    // await PropellerClient.updateCompanyBudget(camp.id, 'decrease', 70);
  }

  // TRIGGER: Bot Pattern (High CTR > 5% but 0 Conv)
  if (stats.ctr > 5.0 && stats.conversions === 0 && stats.clicks > 100) {
    Logger.log('EMERGENCY_STOP', `Bot pattern detected! Pausing campaign.`, { campaign: camp.id });
    await PropellerClient.updateStatus(camp.id, 'stop');
  }
}

async function checkIncrease(camp, stats) {
  // GATE 1: CTR Threshold
  if (stats.ctr < 1.8) {
    // console.log(chalk.gray(`   [🔒 Gate] Denied. CTR ${stats.ctr}% < 1.8% req.`));
    return;
  }

  // GATE 2: ROI Threshold
  if (stats.roi < 150) {
    // console.log(chalk.gray(`   [🔒 Gate] Denied. ROI ${stats.roi}% < 150% req.`));
    return;
  }

  // GATE 3: Conversions Exist
  if (stats.conversions === 0) {
    return;
  }

  // If passed all gates -> APPROVED
  const reason = `CTR ${stats.ctr}% (>1.8%) & ROI ${stats.roi}% (>150%)`;
  const increasePercent = calculateIncreaseTier(stats);

  Logger.log('BUDGET_INCREASE', `Gates Passed! Increasing budget by ${increasePercent}%`, { reason });
  // await PropellerClient.updateCompanyBudget(camp.id, 'increase', increasePercent);
}

function calculateROI(stats) {
  if (stats.cost === 0) return 0;
  const revenue = stats.conversions * 1.50; // Assume $1.50 CPA
  return (revenue / stats.cost) * 100;
}

function calculateIncreaseTier(stats) {
  if (stats.ctr > 2.5 && stats.roi > 200) return 40; // High Confidence
  if (stats.ctr > 2.0) return 25; // Medium
  return 15; // Cautious
}
