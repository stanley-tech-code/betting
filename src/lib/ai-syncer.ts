
import { supabase } from '@/lib/supabase';
import { getZoneStats } from '@/lib/propeller';

/**
 * Syncs PropellerAds zone statistics to the database.
 * @param date YYYY-MM-DD string. Defaults to today.
 */
export async function syncPropellerStats(date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  console.log(`🔄 Syncing Propeller Stats for ${targetDate}...`);

  try {
    // 1. Fetch data from Propeller API
    // We fetch strict range for that single day to ensure data aligns with the date
    const { stats, debug } = await getZoneStats(targetDate, targetDate);

    if (stats.length === 0) {
      console.warn(`⚠️ No stats found for ${targetDate} (or API error)`);
      return { success: false, debug };
    }

    console.log(`✅ Fetched ${stats.length} zone records from Propeller`);

    // 2. Upsert into database
    const upsertData = stats.map((s: any) => ({
      date: targetDate,
      zone_id: s.zone_id,
      campaign_id: String(s.campaign_id),
      impressions: s.impressions,
      clicks: s.clicks,
      conversions: s.conversions, // Propeller's count
      spend: s.money_spent,
      ctr: s.impressions > 0 ? s.clicks / s.impressions : 0,
      cpa: s.conversions > 0 ? s.money_spent / s.conversions : 0
    }));

    // Perform Upsert (requires unique constraint on date, zone_id, campaign_id)
    const { error } = await supabase
      .from('propeller_daily_stats')
      .upsert(upsertData, { onConflict: 'date, zone_id, campaign_id' });

    if (error) {
      console.error('❌ Database Sync Error:', error);
      return { success: false, error: error.message, debug };
    }

    console.log(`💾 Successfully synced ${upsertData.length} records to DB`);

    // 3. Trigger analysis (Optional: could be separate step)
    // await runAIAnalysis(targetDate); 

    return { success: true, count: upsertData.length };

  } catch (error: any) {
    console.error('❌ Sync Failed:', error);
    return { success: false, error: error.message };
  }
}
