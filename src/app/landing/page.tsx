
'use client';

import { useEffect, useState } from 'react';
import { getLandingPageStats, getLandingPageHistory, LandingPageStats, LandingPageHistory } from '@/lib/landing-api';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Eye, MousePointer, TrendingUp, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LandingPage() {
  const [stats, setStats] = useState<LandingPageStats | null>(null);
  const [history, setHistory] = useState<LandingPageHistory | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        getLandingPageStats(),
        getLandingPageHistory()
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch landing page data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = history?.labels.map((label, index) => ({
    name: label,
    visits: history.datasets.visits[index] || 0
  })) || [];

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Landing Page Analytics</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Aviator landing page performance tracking</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Today's Visits"
            value={stats?.today.visits.toLocaleString() || '0'}
            icon={Eye}
            trend={stats?.growth.visits.startsWith('+') ? 'up' : stats?.growth.visits.startsWith('-') ? 'down' : undefined}
            trendValue={stats?.growth.visits || '0%'}
            className="border-l-4 border-l-blue-500"
          />
          <StatsCard
            title="Today's Clicks"
            value={stats?.today.clicks.toLocaleString() || '0'}
            icon={MousePointer}
            trend={stats?.growth.clicks.startsWith('+') ? 'up' : stats?.growth.clicks.startsWith('-') ? 'down' : undefined}
            trendValue={stats?.growth.clicks || '0%'}
            className="border-l-4 border-l-green-500"
          />
          <StatsCard
            title="Click-Through Rate"
            value={stats?.today.ctr || '0%'}
            icon={TrendingUp}
            className="border-l-4 border-l-purple-500"
          />
        </div>

        {/* 7-Day History Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">7-Day Visit Trend</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-zinc-400">Loading chart...</div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line type="monotone" dataKey="visits" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-zinc-400">No data available</div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Tracking Active:</strong> This dashboard displays real-time analytics from your Aviator landing page.
            Data updates automatically when visitors interact with the page.
          </p>
        </div>

      </div>
    </div>
  );
}
