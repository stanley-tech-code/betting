
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to get start of day timestamp
function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sessionId, referrer } = body;

    if (!action || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('landing_stats')
      .insert({
        session_id: sessionId,
        action: action, // 'visit' or 'click'
        referrer: referrer || null
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const todayStart = getStartOfDay();
    const yesterdayStart = getStartOfDay(new Date(Date.now() - 86400000));
    const tomorrowStart = getStartOfDay(new Date(Date.now() + 86400000));

    if (action === 'dashboard-summary') {
      // Fetch stats for today and yesterday

      // Today's stats
      const { count: visitsToday, error: err1 } = await supabase
        .from('landing_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'visit')
        .gte('created_at', todayStart)
        .lt('created_at', tomorrowStart);

      const { count: clicksToday, error: err2 } = await supabase
        .from('landing_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'click')
        .gte('created_at', todayStart)
        .lt('created_at', tomorrowStart);

      // Yesterday's stats (for growth)
      const { count: visitsYesterday, error: err3 } = await supabase
        .from('landing_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'visit')
        .gte('created_at', yesterdayStart)
        .lt('created_at', todayStart);

      const { count: clicksYesterday, error: err4 } = await supabase
        .from('landing_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'click')
        .gte('created_at', yesterdayStart)
        .lt('created_at', todayStart);

      if (err1 || err2 || err3 || err4) {
        throw new Error('Database query failed');
      }

      const vToday = visitsToday || 0;
      const cToday = clicksToday || 0;
      const vYest = visitsYesterday || 0;
      const cYest = clicksYesterday || 0;

      // Calculate growth
      const calcGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const growth = ((current - previous) / previous) * 100;
        return (growth > 0 ? '+' : '') + growth.toFixed(1) + '%';
      };

      // Calculate CTR
      const ctr = vToday > 0 ? ((cToday / vToday) * 100).toFixed(1) + '%' : '0%';

      return NextResponse.json({
        today: { visits: vToday, clicks: cToday, ctr },
        growth: {
          visits: calcGrowth(vToday, vYest),
          clicks: calcGrowth(cToday, cYest)
        }
      });
    }

    if (action === 'history') {
      // Get last 7 days
      const days = [];
      const visitsData = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateKey = d.toISOString().split('T')[0];

        // Count visits for this day
        // Ideally this should be a single query with group by, but for simplicity/reliability with unknown schema constraints loop is fine for small scale
        const dayStart = getStartOfDay(d);
        const nextDayStart = getStartOfDay(new Date(d.getTime() + 86400000));

        const { count } = await supabase
          .from('landing_stats')
          .select('*', { count: 'exact', head: true })
          .eq('action', 'visit')
          .gte('created_at', dayStart)
          .lt('created_at', nextDayStart);

        days.push(dayStr);
        visitsData.push(count || 0);
      }

      return NextResponse.json({
        labels: days,
        datasets: { visits: visitsData }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('API Error:', error);
    // Return empty data on failure to prevent dashboard crash
    if (action === 'dashboard-summary') {
      return NextResponse.json({
        today: { visits: 0, clicks: 0, ctr: '0%' },
        growth: { visits: '0%', clicks: '0%' }
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
