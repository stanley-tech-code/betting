import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    // Fetch daily spend for the last 7 days
    const { data: dailyStats, error } = await supabase
      .from('propeller_daily_stats')
      .select('date, spend')
      .gte('date', last7Days.toISOString().split('T')[0])
      .lte('date', today.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw new Error(`Budget data fetch error: ${error.message}`);

    // Aggregate by date
    const burnRateData = dailyStats?.reduce((acc: any, stat: any) => {
      const existing = acc.find((item: any) => item.date === stat.date);
      if (existing) {
        existing.spend += stat.spend;
      } else {
        acc.push({ date: stat.date, spend: stat.spend });
      }
      return acc;
    }, []) || [];

    // Calculate total spend and average daily burn
    const totalSpend = burnRateData.reduce((sum: number, day: any) => sum + day.spend, 0);
    const avgDailyBurn = burnRateData.length > 0 ? totalSpend / burnRateData.length : 0;

    return NextResponse.json({
      burn_rate_data: burnRateData,
      summary: {
        total_spend_7d: totalSpend.toFixed(2),
        avg_daily_burn: avgDailyBurn.toFixed(2),
        days_tracked: burnRateData.length
      }
    });

  } catch (error: any) {
    console.error('Budget burn rate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
