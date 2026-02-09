
'use client';

import { useState } from 'react';
import { Palette, Play, Pause, Eye, BarChart2, Zap, ArrowRight, X, Map } from 'lucide-react';

export default function CreativeCenter() {
  const [selectedCreative, setSelectedCreative] = useState<any>(null);

  // Mock Creative Data
  const creatives = [
    { id: 'CR-11234', name: '🎰 Big Win Tonight', thumb: '🎰', angle: 'Big Win', lang: 'Sheng', ctr: 2.3, regs: 18, cpr: 8.50, fraud: 12, status: 'WIN' },
    { id: 'CR-11567', name: '💰 Free Spins Now', thumb: '💰', angle: 'Free Spins', lang: 'Eng', ctr: 2.1, regs: 14, cpr: 9.20, fraud: 18, status: 'TEST' },
    { id: 'CR-12345', name: '🎰 Shinda Kubwa', thumb: '❌', angle: 'Big Win', lang: 'Swa', ctr: 0.7, regs: 0, cpr: 0, fraud: 65, status: 'FAIL' },
  ];

  return (
    <div className="space-y-6">

      {/* 1. Header & Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-500" />
          Creative Performance Matrix
        </h2>
        <div className="flex gap-2">
          <FilterButton label="All" active />
          <FilterButton label="Winners" />
          <FilterButton label="Testing" />
          <FilterButton label="Failed" />
        </div>
      </div>

      {/* 2. Performance Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Creative</th>
              <th className="px-6 py-3">Angle</th>
              <th className="px-6 py-3">Lang</th>
              <th className="px-6 py-3">CTR</th>
              <th className="px-6 py-3">Regs</th>
              <th className="px-6 py-3">CPR</th>
              <th className="px-6 py-3">Fraud</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {creatives.map(cr => (
              <tr key={cr.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4">
                  <StatusBadge status={cr.status} />
                </td>
                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                  <span className="text-2xl">{cr.thumb}</span>
                  <div>
                    <div className="text-xs text-zinc-500">{cr.id}</div>
                    <div>{cr.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-300">{cr.angle}</td>
                <td className="px-6 py-4 text-zinc-300">{cr.lang}</td>
                <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{cr.ctr}%</td>
                <td className="px-6 py-4 font-mono text-white">{cr.regs}</td>
                <td className="px-6 py-4 font-mono text-zinc-300">${cr.cpr || '-'}</td>
                <td className="px-6 py-4">
                  <FraudScore score={cr.fraud} />
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedCreative(cr)}
                    className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Deep Dive Modal */}
      {selectedCreative && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-start sticky top-0 bg-zinc-900 z-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl">{selectedCreative.thumb}</span>
                  <h2 className="text-2xl font-bold text-white">{selectedCreative.name}</h2>
                </div>
                <p className="text-zinc-400 text-sm flex gap-2">
                  <span>ID: {selectedCreative.id}</span>
                  <span>•</span>
                  <span className="text-emerald-400">🔥 WINNING CREATIVE</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCreative(null)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Left: Metrics */}
              <div className="md:col-span-2 space-y-8">

                {/* Key Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <StatBox label="CTR" value={`${selectedCreative.ctr}%`} color="text-emerald-400" />
                  <StatBox label="Conversions" value={selectedCreative.regs} color="text-white" />
                  <StatBox label="Native ROI" value="429%" color="text-emerald-400" />
                  <StatBox label="Fraud Score" value={selectedCreative.fraud} color="text-green-400" sub="Very Low" />
                </div>

                {/* Deep Dive Table */}
                <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 p-4">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Metrics: Propeller vs. Reality</h3>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-zinc-800/50">
                      <Row label="Impressions" val1="8,234" val2="-" />
                      <Row label="Clicks" val1="189" val2="189 (Verified)" />
                      <Row label="Cost" val1="$42.00" val2="$42.00" />
                      <Row label="Real Registrations" val1="-" val2="18" highlight />
                      <Row label="Cost Per Reg" val1="-" val2="$2.33" highlight />
                    </tbody>
                  </table>
                </div>

                {/* Insights */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">AI Insights</h3>
                  <InsightItem icon="⏰" text="Best Hours: 9pm - 11pm (CTR 2.8%)" />
                  <InsightItem icon="🗺️" text="Top Zones: #34821, #99213" />
                  <InsightItem icon="📱" text="Device: Android converts 3x better than iOS for this ad" />
                </div>

              </div>

              {/* Right: Actions */}
              <div className="space-y-4">
                <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-xl">
                  <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Recommendation
                  </h3>
                  <p className="text-sm text-zinc-300 mb-4">
                    Excellent performer. Scale budget and generate similar variants.
                  </p>
                  <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg mb-2">
                    🔥 Generate Variants
                  </button>
                  <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg">
                    📈 Increase Bid
                  </button>
                </div>

                <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-xl space-y-2">
                  <button className="w-full flex items-center gap-2 p-2 hover:bg-zinc-800 rounded text-sm text-zinc-300">
                    <Eye className="w-4 h-4" /> View Landing Page
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 hover:bg-zinc-800 rounded text-sm text-zinc-300">
                    <BarChart2 className="w-4 h-4" /> Full History
                  </button>
                  <button className="w-full flex items-center gap-2 p-2 hover:bg-red-900/20 text-red-400 rounded text-sm">
                    <Pause className="w-4 h-4" /> Pause Creative
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 4. Creative Comparison Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            A/B Comparison (Top 3)
          </h3>

          <div className="space-y-4">
            {[creatives[0], creatives[1]].map(cr => (
              <div key={cr.id} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cr.thumb}</span>
                  <div className="text-sm">
                    <div className="font-bold text-zinc-300">{cr.id}</div>
                    <div className="text-xs text-zinc-500">CTR {cr.ctr}%</div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-emerald-400 font-bold">{cr.regs} Regs</div>
                  <div className="text-zinc-500">${cr.cpr} CPR</div>
                </div>
              </div>
            ))}
            <div className="pt-2 text-center text-xs text-zinc-500">
              Statistical Winner: <span className="text-emerald-400 font-bold">{creatives[0].id}</span> (wins 4/5 metrics)
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-indigo-400" />
            Creative x Zone Heatmap
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center">
              <thead>
                <tr>
                  <th className="p-2 text-left text-zinc-500">Creative</th>
                  <th className="p-2 text-zinc-400">#34821</th>
                  <th className="p-2 text-zinc-400">#99213</th>
                  <th className="p-2 text-zinc-400">#66123</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-zinc-800">
                  <td className="p-2 text-left font-mono text-zinc-300">CR-11234</td>
                  <td className="p-2 bg-emerald-500/20 text-emerald-400">🔥🔥🔥</td>
                  <td className="p-2 bg-emerald-500/10 text-emerald-300">🔥🔥</td>
                  <td className="p-2 bg-amber-500/10 text-amber-500">⚠️</td>
                </tr>
                <tr className="border-t border-zinc-800">
                  <td className="p-2 text-left font-mono text-zinc-300">CR-11567</td>
                  <td className="p-2 bg-emerald-500/10 text-emerald-300">🔥🔥</td>
                  <td className="p-2 bg-emerald-500/20 text-emerald-400">🔥🔥🔥</td>
                  <td className="p-2 bg-red-500/10 text-red-500">❌</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

function FilterButton({ label, active }: any) {
  return (
    <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
      {label}
    </button>
  );
}

function StatusBadge({ status }: any) {
  const styles: any = {
    WIN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    TEST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    FAIL: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
}

function FraudScore({ score }: any) {
  let color = 'text-emerald-400';
  if (score > 30) color = 'text-amber-400';
  if (score > 60) color = 'text-red-400';
  return <span className={`font-mono font-bold ${color}`}>{score}</span>;
}

function StatBox({ label, value, color, sub }: any) {
  return (
    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}

function Row({ label, val1, val2, highlight }: any) {
  return (
    <tr className={highlight ? 'bg-indigo-900/10' : ''}>
      <td className="py-2 text-zinc-400">{label}</td>
      <td className="py-2 text-right text-zinc-500 font-mono">{val1}</td>
      <td className={`py-2 text-right font-mono font-medium ${highlight ? 'text-white' : 'text-zinc-300'}`}>{val2}</td>
    </tr>
  );
}

function InsightItem({ icon, text }: any) {
  return (
    <div className="flex gap-3 text-sm text-zinc-300 bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
