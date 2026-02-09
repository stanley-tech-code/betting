import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch zone-level data from propeller_daily_stats
    const { data: zoneData, error } = await supabase
      .from('propeller_daily_stats')
      .select('*')
      .eq('date', today)
      .order('spend', { ascending: false });

    if (error) throw new Error(`Zone data fetch error: ${error.message}`);

    // Calculate fraud scores and tier classifications
    const zones = (zoneData || []).map((zone: any) => {
      const ctr = zone.impressions > 0 ? (zone.clicks / zone.impressions) : 0;
      const convRate = zone.clicks > 0 ? (zone.conversions / zone.clicks) : 0;

      // Fraud score calculation (0-100)
      let fraudScore = 0;
      if (ctr > 0.05) fraudScore += 30; // Abnormally high CTR
      if (convRate === 0 && zone.clicks > 100) fraudScore += 40; // High clicks, no conversions
      if (zone.ctr > 0.1) fraudScore += 30; // Extremely high CTR

      // Tier classification
      let tier = 'C';
      if (zone.conversions >= 5 && zone.cpa <= 15) tier = 'S';
      else if (zone.conversions >= 3 && zone.cpa <= 20) tier = 'A';
      else if (zone.conversions >= 1) tier = 'B';

      return {
        zone_id: zone.zone_id,
        campaign_id: zone.campaign_id,
        impressions: zone.impressions,
        clicks: zone.clicks,
        conversions: zone.conversions,
        spend: zone.spend,
        ctr: (ctr * 100).toFixed(2),
        cpa: zone.cpa,
        fraud_score: Math.min(fraudScore, 100),
        tier,
        status: fraudScore > 60 ? 'BLOCKED' : (tier === 'S' || tier === 'A' ? 'ACTIVE' : 'MONITORING')
      };
    });

    return NextResponse.json({
      zones,
      summary: {
        total_zones: zones.length,
        active: zones.filter((z: any) => z.status === 'ACTIVE').length,
        blocked: zones.filter((z: any) => z.status === 'BLOCKED').length,
        s_tier: zones.filter((z: any) => z.tier === 'S').length,
        a_tier: zones.filter((z: any) => z.tier === 'A').length
      }
    });

  } catch (error: any) {
    console.error('Zone stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
