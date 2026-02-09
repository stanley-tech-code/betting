
'use client';

import { useState } from 'react';
import { Wallet, TrendingUp, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function BudgetCenter({ data }: any) {
  const [executing, setExecuting] = useState(false);
  const rec = data?.budget_recommendation || { action: 'MAINTAIN', amount: 200, reason: "Analyzing..." };

  // Burn rate data will be displayed when available from API
  // For now, showing simplified view without historical chart

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Budget Control Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-emerald-500" />
            Budget Control Center
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-zinc-400 text-sm">Daily Budget</p>
                <p className="text-3xl font-bold text-white">$200.00</p>
              </div>
              <button className="text-sm text-indigo-400 hover:text-indigo-300">✏️ Edit</button>
            </div>

            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[78%]"></div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-emerald-400 font-medium">Spent: $156.34 (78%)</span>
              <span className="text-zinc-500">Remaining: $43.66</span>
            </div>

            {/* Pace Indicator */}
            <div className="bg-zinc-800/50 p-3 rounded-lg flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-emerald-400">Pace: On Track ✅</p>
                <p className="text-xs text-zinc-500">Projected spend: $197.50</p>
              </div>
            </div>

            {/* Mock Graph Area */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2">Hourly Burn Rate</p>
              <div className="flex items-end gap-1 h-24">
                {burnRate.map((b, i) => (
                  <div key={i} className="flex-1 bg-indigo-900/50 hover:bg-indigo-500 transition-colors rounded-t-sm relative group" style={{ height: `${(b.v / 200) * 100}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${b.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI Recommendation Engine */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-32 h-32" />
          </div>

          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-indigo-100">
            < Zap className="w-5 h-5 text-indigo-400" />
            AI Recommendation Engine
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="bg-black/30 p-4 rounded-xl border border-indigo-500/20">
                <p className="text-sm text-indigo-300 uppercase tracking-widest mb-1">Recommended Action</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">{rec.action} BUDGET</span>
                  {rec.action === 'INCREASE' && <TrendingUp className="w-6 h-6 text-emerald-400" />}
                </div>
                <div className="flex items-center gap-2 mt-2 text-zinc-300">
                  <span>$200/day</span>
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-emerald-400 font-bold">$280/day (+40%)</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Confidence Score</p>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[88%]"></div>
                </div>
                <p className="text-xs text-right text-indigo-400">88% Confidence</p>
              </div>

              <button
                disabled={executing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : "✅ Approve Increase"}
              </button>
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium text-zinc-300 border-b border-indigo-500/20 pb-2">Why I recommend this:</p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex gap-2"><span className="text-emerald-400">✅</span> True ROI: 285% (Target: 150%)</li>
                <li className="flex gap-2"><span className="text-emerald-400">✅</span> Real Registrations: 47 today</li>
                <li className="flex gap-2"><span className="text-emerald-400">✅</span> CPA: $3.96 (Target: $15.00)</li>
                <li className="flex gap-2"><span className="text-emerald-400">✅</span> Winning zones have spare capacity</li>
                <li className="flex gap-2"><span className="text-amber-400">⚠️</span> Currently hitting budget limit at 9pm</li>
              </ul>

              <div className="mt-4 pt-4 border-t border-indigo-500/20">
                <p className="text-xs font-semibold text-zinc-300 mb-2">Expected Impact:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/20 p-2 rounded text-zinc-400">+18 Regs/day</div>
                  <div className="bg-black/20 p-2 rounded text-zinc-400">+$350 Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Budget Allocation (Sankey-style as Bars) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Budget Allocation (Where Your Money Goes)</h3>

        <div className="space-y-6">
          <AllocationBar
            label="Winning Zones (Score 80+)"
            percent={70}
            amount={140}
            color="bg-emerald-500"
            details={["Zone #34821 ($68)", "Zone #99213 ($45)"]}
          />
          <AllocationBar
            label="Testing Zones (Score 60-79)"
            percent={20}
            amount={40}
            color="bg-blue-500"
            details={["5 zones active"]}
          />
          <AllocationBar
            label="Experimental (New)"
            percent={10}
            amount={20}
            color="bg-indigo-500"
            details={["3 brand new zones"]}
          />
        </div>
      </div>

      {/* 4. Budget History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Budget History (Last 30 Days)</h3>
          <div className="text-xs text-zinc-500">Total Changes: 8 | AI Recs: 6</div>
        </div>

        <div className="relative h-40 w-full bg-zinc-950/50 rounded-lg border border-zinc-800/50 p-4 flex items-end justify-between gap-2 overflow-hidden">
          {/* Mock Line Graph Representation via Bars for now */}
          {[150, 150, 150, 180, 180, 200, 200, 170, 170, 200, 220, 220, 200, 200, 200].map((h, i) => (
            <div key={i} className="flex-1 bg-indigo-500/20 border-t-2 border-indigo-500 relative group" style={{ height: `${(h / 250) * 100}%` }}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-2 py-1 rounded text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 whitespace-nowrap border border-zinc-700">
                ${h}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
            <p className="text-zinc-500 mb-1">$150-$180 Level</p>
            <p className="text-zinc-300">Avg ROI 265%, 38 Regs/day</p>
          </div>
          <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
            <p className="text-zinc-500 mb-1">$180-$220 Level (Current)</p>
            <p className="text-white font-bold">Avg ROI 285%, 47 Regs/day</p>
          </div>
          <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
            <p className="text-zinc-500 mb-1">$220-$250 Level</p>
            <p className="text-zinc-300">Avg ROI 245%, 62 Regs/day</p>
          </div>
        </div>
      </div>

    </div>
  );
}

function AllocationBar({ label, percent, amount, color, details }: any) {
  return (
    <div className="relative group">
      <div className="flex justify-between text-sm mb-1 text-zinc-400">
        <span>{label}</span>
        <span>${amount} ({percent}%)</span>
      </div>
      <div className="w-full bg-zinc-800 h-8 rounded-lg overflow-hidden relative cursor-pointer">
        <div className={`${color} h-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
        <div className="absolute top-1/2 left-4 -translate-y-1/2 text-xs font-bold text-black/50 uppercase tracking-widest">
          {details.join(', ')}
        </div>
      </div>
    </div>
  );
}

import { DollarSign } from 'lucide-react'; 
