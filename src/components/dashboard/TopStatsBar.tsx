
'use client';

import { Activity, Clock, RefreshCw, Zap, DollarSign, TrendingUp } from 'lucide-react';

interface TopStatsProps {
  loading: boolean;
  performance: any;
  budget: any;
  onRefresh: () => void;
}

export default function TopStatsBar({ loading, performance, budget, onRefresh }: TopStatsProps) {
  // Mock data for things we don't track continuously yet
  const nextAudit = "8m 23s";
  const aiStatus = loading ? "SYNCING..." : "OPTIMIZING";
  const aiStatusColor = loading ? "text-amber-500" : "text-emerald-500";

  const budgetSpent = budget?.spent || 156;
  const budgetTotal = budget?.total || 200;
  const budgetPercent = Math.round((budgetSpent / budgetTotal) * 100);

  const roi = performance?.roi || 0;
  const roiColor = roi > 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400 py-1.5 px-4 flex items-center justify-between sticky top-0 z-50">

      {/* Left: System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-emerald-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">LIVE</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 border-l border-zinc-800 pl-4">
          <Clock className="w-3 h-3" />
          <span>Last Sync: 2s ago</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 border-l border-zinc-800 pl-4">
          <Activity className="w-3 h-3" />
          <span>AI Status: <span className={aiStatusColor}>{aiStatus}</span></span>
        </div>
      </div>

      {/* Right: Key Metrics */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1.5">
          <span>Next Audit: {nextAudit}</span>
        </div>

        <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
          <DollarSign className="w-3 h-3" />
          <span>Budget: ${budgetSpent}/${budgetTotal}</span>
          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${budgetPercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <span className="text-zinc-500">({budgetPercent}%)</span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-4 font-bold">
          <TrendingUp className="w-3 h-3" />
          <span>ROI: <span className={roiColor}>{roi}%</span></span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="ml-2 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

    </div>
  );
}
