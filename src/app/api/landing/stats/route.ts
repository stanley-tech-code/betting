import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    // 1. Get stats for TODAY (UTC)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const startOfDayISO = startOfDay.toISOString();

    const { data: todayStats, error: todayError } = await supabase
      .from('landing_stats')
      .select('*')
      .gte('created_at', startOfDayISO);

    if (todayError) throw todayError;

    // Process Today's Data
    const visits = todayStats.filter(s => s.action === 'visit').length;
    const clicks = todayStats.filter(s => s.action === 'click').length;

    // Hourly Breakdown
    const hourlyData = new Array(24).fill(0).map((_, i) => ({ hour: i, visits: 0, clicks: 0 }));
    todayStats.forEach(stat => {
      const hour = new Date(stat.created_at).getUTCHours();
      if (stat.action === 'visit') hourlyData[hour].visits++;
      if (stat.action === 'click') hourlyData[hour].clicks++;
    });

    // 2. Get History (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Using created_at directly for grouping in JS to avoid complex SQL grouping for now
    const { data: historyStats, error: historyError } = await supabase
      .from('landing_stats')
      .select('created_at, action')
      .gte('created_at', sevenDaysAgo.toISOString())
      .lt('created_at', startOfDayISO); // Exclude today from history

    if (historyError) throw historyError;

    // Process History
    const historyMap = new Map();
    historyStats.forEach(stat => {
      const date = stat.created_at.split('T')[0];
      if (!historyMap.has(date)) historyMap.set(date, { date, visits: 0, clicks: 0 });
      const entry = historyMap.get(date);
      if (stat.action === 'visit') entry.visits++;
      if (stat.action === 'click') entry.clicks++;
    });

    const history = Array.from(historyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: { visits, clicks, conversionRate: visits > 0 ? ((clicks / visits) * 100).toFixed(1) + '%' : '0%' },
      hourly: hourlyData,
      history
    });

  } catch (error: any) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
