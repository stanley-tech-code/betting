import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    // Fetch conversions for the last 7 days
    const { data: conversions, error } = await supabase
      .from('conversions')
      .select('created_at, event_type')
      .gte('created_at', last7Days.toISOString())
      .lte('created_at', today.toISOString());

    if (error) throw new Error(`Time heatmap fetch error: ${error.message}`);

    // Create 24x7 heatmap (hour x day of week)
    const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));

    conversions?.forEach((conv: any) => {
      const date = new Date(conv.created_at);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const hour = date.getHours();
      heatmap[dayOfWeek][hour]++;
    });

    return NextResponse.json({
      heatmap,
      total_conversions: conversions?.length || 0
    });

  } catch (error: any) {
    console.error('Time heatmap error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
