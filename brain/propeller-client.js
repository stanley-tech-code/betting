import axios from 'axios';
import chalk from 'chalk';

const BASE_URL = 'https://ssp-api.propellerads.com/v5';

export const PropellerClient = {
  /**
   * Fetch all active campaigns for Kenya
   */
  getCampaigns: async () => {
    try {
      console.log(chalk.gray('   [📡 API] Fetching live campaigns...'));
      const res = await axios.get(`${BASE_URL}/adv/campaigns`, {
        headers: { 'Authorization': `Bearer ${process.env.PROPELLER_API_KEY}` },
        params: { status: 'working', geo: 'KE' }
      });
      return res.data.result || [];
    } catch (error) {
      handleError('Get Campaigns', error);
      return [];
    }
  },

  /**
   * Get statistics for a specific campaign (Today)
   */
  getStats: async (campaignId) => {
    try {
      // Using the Statistics endpoint
      const res = await axios.post(`${BASE_URL}/adv/statistics`, {
        campaign_id: [campaignId],
        date_from: getTodayStr(),
        date_to: getTodayStr(),
        group_by: ['campaign_id']
      }, {
        headers: { 'Authorization': `Bearer ${process.env.PROPELLER_API_KEY}` }
      });

      const data = res.data.result && res.data.result[0] ? res.data.result[0] : null;

      if (!data) return { impressions: 0, clicks: 0, ctr: 0, conversions: 0, cost: 0 };

      return {
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        ctr: data.ctr || 0,
        conversions: data.conversions || 0,
        cost: data.money || 0
      };
    } catch (error) {
      handleError('Get Stats', error);
      return { impressions: 0, clicks: 0, ctr: 0, conversions: 0, cost: 0 };
    }
  },

  /**
   * Update campaign status (Stop/Start)
   */
  updateStatus: async (campaignId, action) => {
    const endpoint = action === 'stop' ? 'stop' : 'start';
    console.log(chalk.yellow(`   [🔧 API] Sending ${action.toUpperCase()} signal to Campaign #${campaignId}...`));
    try {
      await axios.put(`${BASE_URL}/adv/campaigns/${endpoint}`, {
        campaign_ids: [campaignId]
      }, {
        headers: { 'Authorization': `Bearer ${process.env.PROPELLER_API_KEY}` }
      });
      console.log(chalk.green(`   [✅ API] Campaign #${campaignId} ${action}ed.`));
    } catch (error) {
      handleError('Update Status', error);
    }
  },

  /**
   * Update CPM Bid (Rate)
   */
  updateBid: async (campaignId, newBid) => {
    console.log(chalk.yellow(`   [💰 API] Updating Bid for #${campaignId} to $${newBid}`));
    try {
      // Assuming PATCH for general update based on v5 docs logic
      await axios.patch(`${BASE_URL}/adv/campaigns/${campaignId}`, {
        money_max: newBid // 'rate' or 'money_max' depending on specific campaign type
      }, {
        headers: { 'Authorization': `Bearer ${process.env.PROPELLER_API_KEY}` }
      });
      console.log(chalk.green(`   [✅ API] Bid updated.`));
    } catch (error) {
      handleError('Update Bid', error);
    }
  },

  /**
   * Create a new campaign (Clone & Modify)
   */
  createCampaign: async (creative) => {
    console.log(chalk.magenta(`   [🚀 API] Requesting NEW Campaign: "${creative.title}"`));
    try {
      // Simplified creation - in real world this needs a massive JSON body
      const res = await axios.post(`${BASE_URL}/adv/campaigns`, {
        name: creative.title,
        geo: ['KE'],
        direction: 'native', // example
        rate: 0.05,
        // ... other required fields
      }, {
        headers: { 'Authorization': `Bearer ${process.env.PROPELLER_API_KEY}` }
      });
      return res.data.result;
    } catch (error) {
      handleError('Create Campaign', error);
      return null;
    }
  },

  /**
   * Get statistics grouped by Zone
   */
  getZoneStats: async (campaignId) => {
    try {
      const res = await axios.post(`${BASE_URL}/adv/statistics`, {
        campaign_id: [campaignId],
        date_from: getTodayStr(),
        date_to: getTodayStr(),
        group_by: ['zone_id']
      }, {
        headers: { 'Authorization': `Bearer ${process.env.PROPELLER_API_KEY}` }
      });
      return res.data.result || [];
    } catch (error) {
      handleError('Get Zone Stats', error);
      return [];
    }
  },

  /**
   * Block Zones (AddToExclude)
   */
  blockZone: async (campaignId, zoneIds) => {
    console.log(chalk.red(`   [🛡️ API] Blocking ${zoneIds.length} bad zones for Camp #${campaignId}...`));
    try {
      await axios.patch(`${BASE_URL}/adv/campaigns/${campaignId}`, {
        exclude_zones: zoneIds
      }, {
        headers: { 'Authorization': `Bearer ${process.env.PROPELLER_API_KEY}` }
      });
      console.log(chalk.green(`   [✅ API] Zones blocked.`));
    } catch (error) {
      handleError('Block Zone', error);
    }
  }
};

// --- Helpers ---

const getTodayStr = () => {
  return new Date().toISOString().split('T')[0];
};

const handleError = (context, error) => {
  if (error.response) {
    if (error.response.status === 401) {
      console.error(chalk.red(`   [❌ API] Auth Failed. Check PROPELLER_API_KEY in .env`));
    } else {
      console.error(chalk.red(`   [❌ API] ${context} Error:`), error.response.data || error.message);
    }
  } else {
    console.error(chalk.red(`   [❌ API] ${context} Network Error:`), error.message);
  }
};
