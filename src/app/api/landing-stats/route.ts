import { NextResponse } from 'next/server';

const LANDING_API_URL = process.env.NEXT_PUBLIC_LANDING_API_URL || 'https://betting-stanley-tech-code.vercel.app';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'dashboard-summary';

  try {
    const res = await fetch(`${LANDING_API_URL}/api/stats?action=${action}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) {
      console.error(`Landing API error: ${res.status}`);
      // Return empty data instead of error
      if (action === 'dashboard-summary') {
        return NextResponse.json({
          today: { visits: 0, clicks: 0, ctr: '0%' },
          growth: { visits: '0%', clicks: '0%' }
        });
      }
      if (action === 'history') {
        return NextResponse.json({
          labels: [],
          datasets: { visits: [] }
        });
      }
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Landing API fetch error:', error);

    // Return empty data for graceful degradation
    if (action === 'dashboard-summary') {
      return NextResponse.json({
        today: { visits: 0, clicks: 0, ctr: '0%' },
        growth: { visits: '0%', clicks: '0%' }
      });
    }
    if (action === 'history') {
      return NextResponse.json({
        labels: [],
        datasets: { visits: [] }
      });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
