
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
    const {
      action,
      sessionId,
      click_id,
      zone_id,
      creative_id,
      campaign_id,
      visitor_ip,
      user_agent,
      amount,
      currency
    } = body;

    // Legacy support: map sessionId to click_id if not present
    const finalClickId = click_id || sessionId;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    let error = null;

    if (action === 'visit') {
      // Log entrance to landing page -> ad_clicks table
      const { error: insertError } = await supabase
        .from('ad_clicks')
        .insert({
          click_id: finalClickId,
          zone_id: zone_id || null,
          creative_id: creative_id || null,
          campaign_id: campaign_id || null,
          visitor_ip: visitor_ip || 'unknown',
          user_agent: user_agent || 'unknown',
          created_at: new Date().toISOString()
        });

      // Also log to legacy landing_stats for backward compatibility
      await supabase.from('landing_stats').insert({
        session_id: finalClickId,
        action: 'visit',
        referrer: body.referrer || null
      });

      error = insertError;
    }
    else if (['registration', 'deposit', 'login'].includes(action)) {
      // Log conversion event -> conversions table
      const { error: insertError } = await supabase
        .from('conversions')
        .insert({
          click_id: finalClickId,
          event_type: action,
          amount: amount ? parseFloat(amount) : null,
          currency: currency || 'KES',
          created_at: new Date().toISOString()
        });
      error = insertError;
    }
    else if (action === 'click') {
      // Outbound click to betting site
      // Log to legacy landing_stats
      const { error: legacyError } = await supabase
        .from('landing_stats')
        .insert({
          session_id: finalClickId,
          action: 'click',
          referrer: body.referrer || null
        });

      // Also enter as a 'registration_attempt' or similar if we wanted, but for now just legacy is fine.
      error = legacyError;
    }

    if (error) {
      console.error('Supabase error:', error);
      // We don't return 500 here to avoid client errors if tables are missing, just log
      return NextResponse.json({ error: error.message, warning: "Ensure DB migration is run" }, { status: 200 });
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
      const { count: visitsToday } = await supabase
        .from('landing_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'visit')
        .gte('created_at', todayStart)
        .lt('created_at', tomorrowStart);

      const { count: clicksToday } = await supabase
        .from('landing_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'click')
        .gte('created_at', todayStart)
        .lt('created_at', tomorrowStart);

      // Yesterday's stats (for growth)
      const { count: visitsYesterday } = await supabase
        .from('landing_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'visit')
        .gte('created_at', yesterdayStart)
        .lt('created_at', todayStart);

      const { count: clicksYesterday } = await supabase
        .from('landing_stats')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'click')
        .gte('created_at', yesterdayStart)
        .lt('created_at', todayStart);

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
    if (action === 'dashboard-summary') {
      return NextResponse.json({
        today: { visits: 0, clicks: 0, ctr: '0%' },
        growth: { visits: '0%', clicks: '0%' }
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
