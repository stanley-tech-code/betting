
import { NextResponse } from 'next/server';
import { getCampaignStats } from '@/lib/propeller';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get('debug') === 'true';

  // Default to a broader range (from 2024-01-01) to catch historical data
  const dateTo = searchParams.get('date_to') || new Date().toISOString().split('T')[0];
  const dateFrom = searchParams.get('date_from') || '2024-01-01';

  try {
    if (debug) {
      let debugStats: any[] = [];
      let debugError: any = null;
      try {
        debugStats = await getCampaignStats('2024-01-01', new Date().toISOString().split('T')[0]);
      } catch (e: any) {
        debugError = e.message;
      }

      return NextResponse.json({
        status: 'debug',
        apiKeyPresent: !!process.env.PROPELLER_API_KEY,
        apiKeyPrefix: process.env.PROPELLER_API_KEY ? process.env.PROPELLER_API_KEY.substring(0, 5) : 'NONE',
        apiKeyLength: process.env.PROPELLER_API_KEY ? process.env.PROPELLER_API_KEY.length : 0,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
        fetchedStats: debugStats,
        fetchError: debugError,
        dataLength: debugStats.length,
        dateFrom: '2024-01-01',
        dateTo: new Date().toISOString().split('T')[0]
      });
    }

    const stats = await getCampaignStats(dateFrom, dateTo);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}
