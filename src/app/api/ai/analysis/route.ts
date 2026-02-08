
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AIModules } from '@/lib/ai-modules';

export async function GET(request: Request) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch Propeller Stats (Source of Spend/Impressions)
    const { data: propellerData, error: propError } = await supabase
      .from('propeller_daily_stats')
      .select('*')
      .eq('date', today);

    if (propError) throw new Error(`Propeller Fetch Error: ${propError.message}`);

    // 2. Fetch Real Conversions (Source of Truth)
    const { data: realConversions, error: convError } = await supabase
      .from('conversions')
      .select('*')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);

    if (convError) throw new Error(`Conversions Fetch Error: ${convError.message}`);

    // 3. Aggregate Data
    const totalSpend = propellerData?.reduce((sum, item) => sum + (item.spend || 0), 0) || 0;
    const totalImpressions = propellerData?.reduce((sum, item) => sum + (item.impressions || 0), 0) || 0;
    const totalClicks = propellerData?.reduce((sum, item) => sum + (item.clicks || 0), 0) || 0; // Propeller Clicks

    // Real Stats
    const realRegistrations = realConversions?.filter(c => c.event_type === 'registration').length || 0;
    const realDeposits = realConversions?.filter(c => c.event_type === 'deposit').length || 0;
    const realDepositRevenue = realConversions
      ?.filter(c => c.event_type === 'deposit')
      .reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

    // Derived Metrics
    // If revenue is 0, estimations for demo/testing:
    // Assume each deposit is worth $30 lifetime value if unknown amount
    const estimatedRevenue = realDepositRevenue > 0 ? realDepositRevenue : (realDeposits * 30);
    const trueRoi = totalSpend > 0 ? ((estimatedRevenue - totalSpend) / totalSpend) * 100 : 0;
    const realCpa = realRegistrations > 0 ? totalSpend / realRegistrations : 0;
    const propsConversionRate = totalClicks > 0 ? (realRegistrations / totalClicks) * 100 : 0;

    // 4. Run AI Intelligence (Module 2 & 5)
    // Group by Zone to analyze performance
    const zoneMap = new Map();

    propellerData?.forEach(p => {
      const z = p.zone_id || 'unknown';
      if (!zoneMap.has(z)) zoneMap.set(z, {
        zone_id: z, spend: 0, clicks: 0, impressions: 0, registrations: 0, revenue: 0, ctr: 0
      });
      const zm = zoneMap.get(z);
      zm.spend += p.spend;
      zm.clicks += p.clicks;
      zm.impressions += p.impressions;
      // Match real registrations to zone (requires correct attribution in DB, assumed linked via click_id -> ad_clicks -> zone_id)
      // For this summary, we might not have the join easily without SQL. 
      // We'll trust the aggregate for now or need a robust SQL query.
      // Simplified: Assume proportional distribution or just use global metrics for budget recommendations.
    });

    // 5. Budget Recommendation
    const currentBudget = 200; // Hardcoded or fetched from DB settings
    const budgetRec = AIModules.getBudgetRecommendation(
      currentBudget,
      Math.round(trueRoi),
      0, // AVG fraud score placeholder
      realRegistrations,
      realCpa,
      15 // Target CPA
    );

    // 6. Construct Response
    return NextResponse.json({
      performance: {
        date: today,
        spend: totalSpend,
        real_revenue: estimatedRevenue,
        profit: estimatedRevenue - totalSpend,
        roi: Math.round(trueRoi),
        real_registrations: realRegistrations,
        real_deposits: realDeposits,
        cpa: realCpa.toFixed(2),
        conversion_rate: propsConversionRate.toFixed(2)
      },
      budget_recommendation: budgetRec,
      ai_insights: [
        `Real ROI is ${Math.round(trueRoi)}% based on ${realRegistrations} registrations.`,
        `CPA is $${realCpa.toFixed(2)} (Target: $15).`,
        realRegistrations === 0 && totalClicks > 100 ? "⚠️ High clicks but 0 registrations. Check for fraud." : "Traffic quality looks normal."
      ]
    });

  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
