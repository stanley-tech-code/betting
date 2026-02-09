'use client';

import { useEffect, useState } from 'react';
import { Users, MousePointer2, Percent, History, BarChart3 } from 'lucide-react';

interface StatsData {
  summary: {
    visits: number;
    clicks: number;
    conversionRate: string;
  };
  hourly: {
    hour: number;
    visits: number;
    clicks: number;
  }[];
  history: {
    date: string;
    visits: number;
    clicks: number;
  }[];
}

export default function LandingStats() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/landing/stats');
      if (res.ok) {
        const jsonData = await res.json();
        setData(jsonData);
      }
    } catch (e) {
      console.error('Failed to load stats', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Visitors (Today)"
          value={data.summary.visits.toString()}
          icon={Users}
          color="text-blue-400"
        />
        <StatsCard
          title="Button Clicks (Today)"
          value={data.summary.clicks.toString()}
          icon={MousePointer2}
          color="text-green-400"
        />
        <StatsCard
          title="Conversion Rate"
          value={data.summary.conversionRate}
          icon={Percent}
          color="text-purple-400"
        />
      </div>

      {/* Hourly Chart (Simple Bar) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-zinc-400" />
            Hourly Traffic (Today)
          </h3>
        </div>

        <div className="h-48 flex items-end justify-between gap-1">
          {data.hourly.map((h) => {
            // Find max for scaling
            const max = Math.max(...data.hourly.map(d => d.visits)) || 1;
            const height = (h.visits / max) * 100;

            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full bg-zinc-800 rounded-t-sm relative transition-all group-hover:bg-indigo-900/50" style={{ height: `${height}%`, minHeight: '4px' }}>
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-zinc-700 text-xs px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                    {h.visits} visits
                  </div>
                </div>
                <span className="text-[10px] text-zinc-600">{h.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <History className="w-5 h-5 text-zinc-400" />
          <h3 className="font-medium text-zinc-100">History (Last 7 Days)</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-950 text-zinc-500">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Visitors</th>
              <th className="px-6 py-3 font-medium">Clicks</th>
              <th className="px-6 py-3 font-medium">CTR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {data.history.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-zinc-600">No history available yet</td></tr>
            ) : (
              data.history.map((day) => (
                <tr key={day.date} className="hover:bg-zinc-950/50">
                  <td className="px-6 py-4 text-zinc-300">{day.date}</td>
                  <td className="px-6 py-4 text-zinc-400">{day.visits}</td>
                  <td className="px-6 py-4 text-zinc-400">{day.clicks}</td>
                  <td className="px-6 py-4 text-indigo-400">
                    {day.visits > 0 ? ((day.clicks / day.visits) * 100).toFixed(1) + '%' : '0%'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-zinc-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-zinc-100 mt-1">{value}</p>
      </div>
      <div className={`p-3 bg-zinc-950 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
