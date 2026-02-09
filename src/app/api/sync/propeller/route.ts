import { NextResponse } from 'next/server';
import { syncPropellerStats } from '@/lib/ai-syncer';

export const maxDuration = 60; // Allow up to 60 seconds for sync

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting PropellerAds data sync...');

    // Sync today's data
    const today = new Date().toISOString().split('T')[0];
    await syncPropellerStats(today);

    console.log('✅ PropellerAds data sync completed successfully');

    return NextResponse.json({
      success: true,
      message: 'PropellerAds data synced successfully',
      date: today,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ PropellerAds sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
