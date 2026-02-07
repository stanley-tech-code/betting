import chalk from 'chalk';
import cron from 'node-cron';
import { DecisionEngine } from './decision-engine.js';
import { CreativeGenerator } from './ai-creative.js';
import { FraudGuard } from './fraud-guard.js';

export const startBrain = async () => {
  console.log(chalk.green('✅ AI Core Online. Waiting for cycle...'));

  // Run immediately on start
  await runCycle();

  // Schedule: Every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    runCycle();
  });
};

export const runCycle = async () => {
  console.log(chalk.white.bold(`\n🔄 Cycle Started: ${new Date().toLocaleTimeString()}`));

  // 0. CHECK REMOTE STATUS
  try {
    const { DataStore } = await import('./data-store.js'); // Dynamic import to avoid cycles if any
    const status = await DataStore.getConfig('status');
    if (status === 'paused') {
      console.log(chalk.yellow('⏸️ SYSTEM PAUSED BY DASHBOARD. Skipping cycle.'));
      return;
    }
  } catch (e) { console.error("Config Check Error:", e.message); }

  try {
    // 1. Analyze & Decide
    const campaigns = await DecisionEngine.run();

    // 2. Fraud Check
    if (campaigns && campaigns.length > 0) {
      await FraudGuard.scanAndBlock(campaigns);
    }

    console.log(chalk.green(`✨ Cycle Complete. Next run in 15m.`));
  } catch (err) {
    console.error(chalk.red('⚠️ Cycle Error:'), err.message);
  }
};
