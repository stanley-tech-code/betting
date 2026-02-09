
'use client';

import {
  TrendingUp, DollarSign, Users, Wallet, CreditCard,
  ArrowUpRight, ArrowDownRight, Activity, Zap, ShieldAlert
} from 'lucide-react';

export default function CommandCenter({ data }: any) {
  const p = data?.performance || {};

  // Mock trends for demo (since we don't have historical delta in this API response yet)
  const trends = {
    profit: { val: "+18%", positive: true },
    roi: { val: "+6%", positive: true },
    regs: { val: "+12", positive: true },
    deps: { val: "+3", positive: true },
    cpa: { val: "-$1.20", positive: true } // Negative cost is good
  };

  return (
    <div className="space-y-6">

      {/* 1. Hero Metrics - The Big 5 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <HeroCard
          title="P/L TODAY"
          value={`$${p.profit?.toFixed(2) || '0.00'}`}
          trend={trends.profit.val}
          positive={trends.profit.positive}
          icon={DollarSign}
        />
        <HeroCard
          title="ROI"
          value={`${p.roi || 0}%`}
          trend={trends.roi.val}
          positive={trends.roi.positive}
          icon={TrendingUp}
        />
        <HeroCard
          title="REGISTRATIONS"
          value={p.real_registrations || 0}
          trend={trends.regs.val}
          positive={trends.regs.positive}
          icon={Users}
        />
        <HeroCard
          title="DEPOSITS"
          value={p.real_deposits || 0}
          trend={trends.deps.val}
          positive={trends.deps.positive}
          icon={CreditCard}
        />
        <HeroCard
          title="COST PER REG"
          value={`$${p.cpa || '0.00'}`}
          trend={trends.cpa.val}
          positive={trends.cpa.positive}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 2. Real-Time Activity Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden max-h-[400px]">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
            <h3 className="font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE ACTIVITY FEED
            </h3>
            <span className="text-xs text-zinc-500">Auto-scroll ON</span>
          </div>

          <div className="overflow-y-auto p-0 flex-1 bg-zinc-950/50 font-mono text-sm">
            <ActivityItem time="Just now" icon="💰" text="Zone #34821 bid +$0.05 → $0.65 (CPR dropped)" color="text-emerald-400" />
            <ActivityItem time="3s ago" icon="⚠️" text="Creative CR-12345 fraud score: 65 → PAUSED" color="text-amber-400" />
            <ActivityItem time="8s ago" icon="👤" text="New registration: Zone #99213, CR-11234" color="text-blue-400" />
            <ActivityItem time="12s ago" icon="💳" text="DEPOSIT: $500 KES (User #5678, 32m after reg)" color="text-purple-400" highlight />
            <ActivityItem time="18s ago" icon="🗑️" text="Zone #88234 BLOCKED (bot pattern detected)" color="text-red-400" />
            <ActivityItem time="23s ago" icon="🔥" text="Creative variant generated (parent: CR-11567)" color="text-orange-400" />
            <ActivityItem time="45s ago" icon="🤖" text="AI Analysis Cycle Complete: 124 Patterns Checked" color="text-zinc-500" />
            {data?.ai_insights?.map((insight: string, i: number) => (
              <ActivityItem key={i} time="1m ago" icon="🧠" text={insight} color="text-indigo-400" />
            ))}
          </div>
        </div>

        {/* 3. AI Brain Status */}
        <div className="bg-zinc-900 text-white rounded-xl border border-zinc-800 p-6 flex flex-col gap-4 shadow-lg">
          <h3 className="font-semibold flex items-center gap-2 text-indigo-400">
            <Zap className="w-5 h-5" />
            AI BRAIN STATUS
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Current Process: ANALYZING ZONES</span>
              <span>63%</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[63%] animate-pulse" />
            </div>
          </div>

          <div className="space-y-3 mt-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Recent Decisions</p>
            <div className="space-y-2 text-xs">
              <div className="flex gap-2">
                <span>✅</span>
                <span>Increased bid on 3 zones</span>
              </div>
              <div className="flex gap-2">
                <span>❌</span>
                <span>Blocked 1 zone (fraud)</span>
              </div>
              <div className="flex gap-2">
                <span>💡</span>
                <span className="text-yellow-200">Discovered pattern: "Fri 9pm = High Conv"</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-auto pt-4 border-t border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Queue</p>
            <ol className="text-xs space-y-1 text-zinc-400 list-decimal list-inside">
              <li>Generate budget recommendation</li>
              <li>Verify experiment stability</li>
              <li>Sync Propeller costs</li>
            </ol>
          </div>
        </div>

      </div>

    </div>
  );
}

function HeroCard({ title, value, trend, positive, icon: Icon }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-indigo-500 transition-colors cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{title}</p>
        <Icon className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
      </div>
      <div className="flex items-end gap-2">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</h3>
      </div>
      <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  );
}

function ActivityItem({ time, icon, text, color, highlight }: any) {
  return (
    <div className={`px-4 py-2 border-b border-zinc-800/50 flex gap-3 items-start ${highlight ? 'bg-indigo-900/10' : 'hover:bg-zinc-900'}`}>
      <span className="text-zinc-600 whitespace-nowrap min-w-[60px]">{time}</span>
      <span className="">{icon}</span>
      <span className={`${color} leading-tight`}>{text}</span>
    </div>
  );
}


