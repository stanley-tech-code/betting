
import { NextResponse } from 'next/server';
import { AIModules } from '@/lib/ai-modules';
import { syncPropellerStats } from '@/lib/ai-syncer';
import { ABTestManager } from '@/lib/ab-test-manager';

// Validate CRON_SECRET to prevent unauthorized triggering
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Check auth header if running via Vercel Cron
  // For dev/demo, we might skip this or use a query param
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    // allow manual override for dev: ?key=DEV_OVERRIDE
    const { searchParams } = new URL(request.url);
    if (searchParams.get('key') !== 'DEV_OVERRIDE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const logs = [];
  try {
    // 1. Sync Data
    logs.push("Starting Sync...");
    await syncPropellerStats();
    logs.push("✅ Propeller Stats Synced");

    // 2. Learn Patterns
    logs.push("Starting Pattern Learning...");
    const patterns = await AIModules.detectPatterns();
    logs.push(`✅ Patterns Detected: ${patterns?.length || 0}`);

    // 3. Experimentation Engine (Phase 4)
    logs.push("Running Experimentation Engine...");
    const abLogs = await ABTestManager.runDailyCycle();
    logs.push(...abLogs);
    logs.push("✅ Experiment Cycle Complete");

    return NextResponse.json({ success: true, logs });

  } catch (error: any) {
    console.error('Scheduler Error:', error);
    return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
  }
}
