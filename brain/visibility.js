import { DataStore } from './data-store.js';

// 1. REAL-TIME ACTIVITY LOG SERVICE
export const ActivityLogger = {
  logAction: async (type, details) => {
    const icon = getIcon(type);
    const severity = getSeverity(type);

    // Create a user-friendly message based on type and details if not provided
    let message = details.message || `Action: ${type}`;
    if (!details.message) {
      if (type === 'budget_increase') message = `Budget Increased by $${details.amount}`;
      if (type === 'zone_blocked') message = `Zone #${details.zone_id} Blocked`;
      if (type === 'creative_paused') message = `Creative #${details.creative_id} Paused`;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      type: type,
      severity: severity,
      icon: icon,
      message: message,
      details: details,
      user_visible: true
    };

    await DataStore.logActivity(entry);
    console.log(`[ACTIVITY] ${icon} ${message}`);
  }
};

function getIcon(type) {
  const icons = {
    'budget_increase': '💰',
    'budget_decrease': '📉',
    'creative_paused': '⚠️',
    'creative_activated': '✅',
    'zone_blocked': '❌',
    'zone_whitelisted': '🏆',
    'variant_generated': '🔥',
    'bot_detected': '🚫',
    'audit_complete': '📊',
    'decision_approved': '✅',
    'decision_rejected': '❌'
  };
  return icons[type] || '📌';
}

function getSeverity(type) {
  if (['zone_blocked', 'creative_paused', 'bot_detected', 'decision_rejected'].includes(type)) return 'warning';
  if (['budget_increase', 'creative_activated', 'variant_generated', 'zone_whitelisted', 'decision_approved'].includes(type)) return 'success';
  return 'info';
}

// 2. DECISION TRACKER
export const DecisionTracker = {
  logDecision: async (type, decision, reasoning, impact, entityType, entityId) => {
    const entry = {
      timestamp: new Date().toISOString(),
      decision_type: type, // 'approved', 'rejected', 'paused', 'activated', 'blocked'
      entity_type: entityType,
      entity_id: String(entityId),
      decision: decision,
      reasoning: reasoning,
      impact: impact,
      executed: true,
      execution_timestamp: new Date().toISOString()
    };

    await DataStore.logDecision(entry);

    // Also log as an activity for the feed
    await ActivityLogger.logAction(`decision_${type}`, {
      message: `${decision}: ${reasoning}`,
      entity_id: entityId,
      impact
    });
  }
};

// 3. REAL-TIME PROCESS MONITOR
export const ProcessMonitor = {
  startProcess: async (name, description) => {
    const process = {
      status: 'RUNNING',
      description: description,
      started_at: new Date().toISOString(),
      progress: 0,
      substeps: [],
      completed_at: null,
      result: null
    };

    await DataStore.updateProcess(name, process);
    return name;
  },

  updateProcess: async (name, update) => {
    // Fetch current if needed (skipped for speed, assuming blind update is fine or we merge in DB)
    // For simplicity in this serverless context, we just overwrite/upsert properties
    await DataStore.updateProcess(name, update);
  },

  completeProcess: async (name, result) => {
    const update = {
      status: 'COMPLETE',
      completed_at: new Date().toISOString(),
      progress: 100,
      result: result
    };
    await DataStore.updateProcess(name, update);
  }
};

// 4. AUDIT SERVICE
export const AuditService = {
  // This function will be called by the Brain (cron.js) every cycle (approx 10-15 mins)
  runAudit: async () => {
    const startTime = Date.now();
    await ActivityLogger.logAction('audit_start', { message: 'Starting 10-minute audit' });

    // 1. Fetch Latest Data (Mocked or Real from DataStore)
    // In a real scenario, this aggregates data from the 'performance' table since the last audit
    // We will fetch the *previous* audit to compare
    const previousAudit = await DataStore.getLatestAudit();

    // Mocking current metrics calculation based on DataStore.getPerformance() or real APIs
    // For now, we simulate "Current 10m" data

    const currentParams = {
      impressions: Math.floor(10000 + Math.random() * 2000),
      clicks: Math.floor(150 + Math.random() * 50),
      conversions: Math.floor(Math.random() * 3),
      spend: (Math.random() * 5).toFixed(2),
    };

    const metrics = calculateMetrics(currentParams, previousAudit);

    // 2. Health Score
    const healthScore = calculateHealthScore(metrics);

    // 3. Construct Report
    const report = {
      timestamp: new Date().toISOString(),
      period_start: previousAudit ? previousAudit.timestamp : new Date(startTime - 600000).toISOString(),
      period_end: new Date(startTime).toISOString(),

      impressions_current: currentParams.impressions,
      impressions_previous: previousAudit ? previousAudit.impressions_current : 0,

      clicks_current: currentParams.clicks,
      clicks_previous: previousAudit ? previousAudit.clicks_current : 0,

      ctr_current: metrics.ctr.current,
      ctr_previous: metrics.ctr.previous,

      spend_current: Number(currentParams.spend),
      conversions_current: currentParams.conversions,
      epc_current: (currentParams.spend / (currentParams.clicks || 1)).toFixed(4), // rough est
      // 3. actions taken (decisions since last audit)
      const recentDecisions = await DataStore.getRecentDecisions(10); // get last 10 decisions or from timeframe
      // Filter decisions that happened after period_start
      const actionsTaken = recentDecisions.filter(d => new Date(d.timestamp) > new Date(report.period_start));

      report.actions_taken = actionsTaken;

      // 4. Budget Check
      const budgetCheck = checkBudgetEligibility(metrics, report.period_end);
      report.budget_check = budgetCheck;

      // 5. Save & Log
      await DataStore.saveAudit(report);

      await ActivityLogger.logAction('audit_complete', {
        message: `Audit Complete. Health: ${healthScore}/100. CTR: ${report.ctr_current}%`,
        health: healthScore,
        budget_adjust: budgetCheck.approved ? 'YES' : 'NO'
      });

      return report;
    }
  };

  function calculateMetrics(curr, prev) {
    const prevClicks = prev ? prev.clicks_current : 0;
const prevImps = prev ? prev.impressions_current : 0;
const prevCTR = prevImps > 0 ? (prevClicks / prevImps * 100) : 0;

const currCTR = (curr.clicks / curr.impressions * 100);

return {
  ctr: {
    current: currCTR.toFixed(2),
    previous: prevCTR.toFixed(2)
  },
  roi: {
    current: (150 + Math.random() * 50).toFixed(0) // Mock ROI
  }
};
}

function calculateHealthScore(metrics) {
  let score = 70;
  if (metrics.ctr.current >= 1.8) score += 20;
  else if (metrics.ctr.current >= 1.0) score += 10;
  return Math.min(100, score + Math.floor(Math.random() * 10));
}

function generateRecommendations(metrics) {
  const recs = [];
  if (metrics.ctr.current > 2.0) recs.push("CTR is surging. Recommend 10% budget scale.");
  if (metrics.ctr.current < 1.0) recs.push("CTR low. Rotate creatives immediately.");
  return recs;
}

function checkBudgetEligibility(metrics, timestamp) {
  const isCtrGood = metrics.ctr.current >= 1.8;
  const isRoiGood = metrics.roi.current >= 150;

  return {
    ctr_check: { value: metrics.ctr.current + '%', passed: isCtrGood, threshold: '1.8%' },
    roi_check: { value: metrics.roi.current + '%', passed: isRoiGood, threshold: '150%' },
    approved: isCtrGood && isRoiGood,
    timestamp: timestamp
  };
}
