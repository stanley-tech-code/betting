
'use client';

import { useEffect, useState } from 'react';
import { CampaignStats } from '@/lib/propeller';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CampaignChart } from '@/components/dashboard/CampaignChart';
import { CampaignTable } from '@/components/dashboard/CampaignTable';
import { Activity, DollarSign, MousePointer, Eye, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  // Calculate Aggregates
  const totalImpressions = stats.reduce((acc, curr) => acc + curr.impressions, 0);
  const totalClicks = stats.reduce((acc, curr) => acc + curr.clicks, 0);
  const totalSpend = stats.reduce((acc, curr) => acc + curr.money_spent, 0);
  const totalProfit = stats.reduce((acc, curr) => acc + curr.profit, 0);
  const totalRevenue = totalSpend + totalProfit; // Approximation

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">PropellerAds Overview</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Real-time campaign performance analytics.</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
            Error: {error}
          </div>
        )}

        {!loading && stats.length === 0 && !error && (
          <div className="p-6 text-center bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 font-medium">⏳ No data available</p>
            <p className="text-yellow-600 text-sm mt-2">
              This could be due to API rate limiting. Please wait a few minutes and click "Refresh Data" above.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Spend"
            value={`$${totalSpend.toFixed(2)}`}
            icon={DollarSign}
            className="border-l-4 border-l-indigo-500"
          />
          <StatsCard
            title="Total Revenue (Est)"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={Activity}
            trend={totalProfit >= 0 ? 'up' : 'down'}
            trendValue={`$${Math.abs(totalProfit).toFixed(2)} Profit`}
            className="border-l-4 border-l-emerald-500"
          />
          <StatsCard
            title="Impressions"
            value={totalImpressions.toLocaleString()}
            icon={Eye}
          />
          <StatsCard
            title="Clicks"
            value={totalClicks.toLocaleString()}
            icon={MousePointer}
            subValue={`CTR: ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0}%`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Top Campaigns by Spend</h2>
            {loading ? (
              <div className="h-[350px] flex items-center justify-center text-zinc-400">Loading chart...</div>
            ) : (
              <CampaignChart data={stats} />
            )}
          </div>

          {/* Recent Activity / Side Panel */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Performance Summary</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-500">ROI</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {totalSpend > 0 ? ((totalProfit / totalSpend) * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${Math.min(Math.max(totalSpend > 0 ? (totalProfit / totalSpend) * 100 : 0, 0), 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-900 mb-2">Key Metrics</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Avg CPC</dt>
                    <dd className="font-medium">${totalClicks > 0 ? (totalSpend / totalClicks).toFixed(3) : '0.00'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Avg CPM</dt>
                    <dd className="font-medium">${totalImpressions > 0 ? ((totalSpend / totalImpressions) * 1000).toFixed(3) : '0.00'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Campaign Details</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading data...</div>
          ) : (
            <CampaignTable data={stats} />
          )}
        </div>

      </div>
    </div>
  );
}
