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
    const { ProcessMonitor, AuditService } = await import('./visibility.js');

    // 1. Analyze & Decide
    await ProcessMonitor.startProcess('analysis_cycle', 'Running detailed campaign analysis');
    await ProcessMonitor.updateProcess('analysis_cycle', { progress: 20, substeps: ['Fetching campaign data', 'Calculating CTR/ROI'] });

    const campaigns = await DecisionEngine.run();

    await ProcessMonitor.updateProcess('analysis_cycle', { progress: 60, substeps: [`Analyzed ${campaigns ? campaigns.length : 0} campaigns`] });

    // 2. Fraud Check
    if (campaigns && campaigns.length > 0) {
      await ProcessMonitor.updateProcess('analysis_cycle', { progress: 80, substeps: ['Scanning for bot patterns'] });
      await FraudGuard.scanAndBlock(campaigns);
    }

    await ProcessMonitor.completeProcess('analysis_cycle', { status: 'success', campaigns_scanned: campaigns ? campaigns.length : 0 });

    // 3. Audit Report
    console.log(chalk.blue('📊 Generating 10-Minute Audit Report...'));
    await AuditService.runAudit();

    console.log(chalk.green(`✨ Cycle Complete. Next run in 15m.`));
  } catch (err) {
    console.error(chalk.red('⚠️ Cycle Error:'), err.message);
    // Log error to activity feed too
    try {
      const { ActivityLogger } = await import('./visibility.js');
      await ActivityLogger.logAction('system_error', { message: err.message });
    } catch (e) { }
  }
};
