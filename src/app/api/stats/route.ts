
import { NextResponse } from 'next/server';
import { getCampaignStats } from '@/lib/propeller';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Default to a broader range (from 2024-01-01) to catch historical data
  const dateTo = searchParams.get('date_to') || new Date().toISOString().split('T')[0];
  const dateFrom = searchParams.get('date_from') || '2024-01-01';

  try {
    const stats = await getCampaignStats(dateFrom, dateTo);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}
