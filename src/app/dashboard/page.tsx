
'use client';

import { useEffect, useState } from 'react';
import { BrainCircuit, LayoutDashboard, Wallet, Palette, Map, Clock } from 'lucide-react';
import TopStatsBar from '@/components/dashboard/TopStatsBar';
import CommandCenter from '@/components/dashboard/CommandCenter';
import BudgetCenter from '@/components/dashboard/BudgetCenter';
import CreativeCenter from '@/components/dashboard/CreativeCenter';
import ZoneCenter from '@/components/dashboard/ZoneCenter';
import TimeCenter from '@/components/dashboard/TimeCenter';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('command');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalysis() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analysis');
      if (!res.ok) throw new Error('Failed to load data');
      const jsonData = await res.json();
      setData(jsonData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const tabs = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget Intelligence', icon: Wallet },
    // { id: 'creative', label: 'Creative Intelligence', icon: Palette }, // Disabled - not tracking creatives yet
    { id: 'zone', label: 'Zone Intelligence', icon: Map },
    { id: 'time', label: 'Time Intelligence', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

      {/* 1. Global Top Bar */}
      <TopStatsBar
        loading={loading}
        performance={data?.performance}
        budget={{ spent: data?.performance?.spend, total: 200 }}
        onRefresh={fetchAnalysis}
      />

      {/* 2. Navigation Tabs */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-4">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 font-medium'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'command' && <CommandCenter data={data} />}
          {activeTab === 'budget' && <BudgetCenter data={data} />}
          {activeTab === 'creative' && <CreativeCenter />}
          {activeTab === 'zone' && <ZoneCenter />}
          {activeTab === 'time' && <TimeCenter />}
        </div>
      </main>

    </div>
  );
}
