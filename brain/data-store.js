import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase if credentials exist
const supabase = process.env.SUPABASE_URL
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

export const DataStore = {
  // --- CREATIVES ---
  getCreatives: async () => {
    if (!supabase) return [];
    const { data } = await supabase.from('creatives').select('*');
    return data || [];
  },

  saveCreative: async (creative) => {
    if (!supabase) return;

    // Upsert (Insert or Update on Conflict)
    const { error } = await supabase
      .from('creatives')
      .upsert({
        creative_id: creative.creative_id,
        campaign_id: creative.campaign_id,
        title: creative.title,
        description: creative.description,
        emoji_set: creative.emoji_set,
        language: creative.language,
        angle: creative.angle,
        status: creative.status,
        ctr: creative.ctr,
        epc: creative.epc,
        total_impressions: creative.total_impressions,
        total_clicks: creative.total_clicks,
        total_conversions: creative.total_conversions,
        total_spend: creative.total_spend,
        last_tested_at: new Date()
      }, { onConflict: 'creative_id' });

    if (error) console.error("Supabase Error (Creatives):", error.message);
  },

  // --- ZONES ---
  getZones: async () => {
    if (!supabase) return [];
    const { data } = await supabase.from('zones').select('*');
    return data || [];
  },

  updateZone: async (zone) => {
    if (!supabase) return;

    // Check if exists logic done by Upsert usually, but we might want to be careful not to overwrite totals if passing partial
    // Ideally we fetch first or use UPSERT with specific columns
    // For simplicity: Upsert with all provided fields

    const { error } = await supabase
      .from('zones')
      .upsert({
        zone_id: zone.zone_id,
        traffic_source: zone.traffic_source || 'propeller',
        avg_ctr: zone.avg_ctr,
        avg_epc: zone.avg_epc,
        quality_score: zone.quality_score,
        status: zone.status,
        total_impressions: zone.total_impressions, // Note: In real app, we'd increment these
        total_clicks: zone.total_clicks,
        total_spend: zone.total_spend,
        total_conversions: zone.total_conversions,
        last_seen: new Date()
        // blocked_at, whitelisted_at would be passed if changed
      }, { onConflict: 'zone_id' });

    if (error) console.error("Supabase Error (Zones):", error.message);
  },

  // --- PERFORMANCE HISTORY ---
  recordPerf: async (data) => {
    if (!supabase) return;

    const { error } = await supabase.from('performance').insert({
      creative_id: data.creative_id,
      zone_id: data.zone_id,
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours(),
      impressions: data.impressions,
      clicks: data.clicks,
      conversions: data.conversions,
      spend: data.spend,
      device_type: data.device_type
    });

    if (error) console.error("Supabase Error (Perf):", error.message);
  },

  getPerformance: async () => {
    if (!supabase) return [];
    // fetch last 1000 records
    const { data } = await supabase.from('performance').select('*').limit(1000).order('created_at', { ascending: false });
    return data || [];
  },

  // --- BUDGET LOGS ---
  logBudgetChange: async (log) => {
    if (!supabase) return;
    await supabase.from('budget_logs').insert({
      campaign_id: log.campaignId,
      change_type: log.type,
      amount: log.amount,
      reason: log.reason,
      ctr_at_time: log.ctr,
      roi_at_time: log.roi
    });
  },

  // --- SYSTEM LOGS ---
  saveSystemLog: async (entry) => {
    if (!supabase) return;
    await supabase.from('system_logs').insert({
      type: entry.type,
      message: entry.message,
      details: entry.details,
      created_at: entry.timestamp
    });
  },

  getSystemLogs: async (limit = 20) => {
    if (!supabase) return [];
    const { data } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    return data || [];
  },

  // --- SYSTEM CONFIG ---
  getConfig: async (key) => {
    if (!supabase) return null;
    const { data } = await supabase.from('system_config').select('value').eq('key', key).single();
    return data ? data.value : null;
  },

  setConfig: async (key, value) => {
    if (!supabase) return;
    await supabase.from('system_config').upsert({ key, value, updated_at: new Date() });
  }
};
