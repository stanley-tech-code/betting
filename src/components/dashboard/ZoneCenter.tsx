
'use client';

import { useState } from 'react';
import { Map, ShieldAlert, Smartphone, Globe, Eye, Ban, CheckCircle } from 'lucide-react';

export default function ZoneCenter() {
  const [selectedZone, setSelectedZone] = useState<any>(null);

  // Mock Zone Data
  const zones = [
    { id: '34821', tier: 'PREMIUM', carrier: 'Safaricom', device: 'Android', ctr: 2.8, regs: 12, cpr: 8.50, fraud: 8, score: 96, status: 'WHITELISTED' },
    { id: '99213', tier: 'HIGH', carrier: 'Safaricom', device: 'Android', ctr: 2.1, regs: 8, cpr: 9.20, fraud: 12, score: 89, status: 'ACTIVE' },
    { id: '66123', tier: 'TEST', carrier: 'Airtel', device: 'iOS', ctr: 1.4, regs: 1, cpr: 12.00, fraud: 28, score: 62, status: 'TESTING' },
    { id: '88234', tier: 'BLOCKED', carrier: 'Telkom', device: 'Android', ctr: 8.2, regs: 0, cpr: 0, fraud: 95, score: -8, status: 'BLOCKED' },
  ];

  return (
    <div className="space-y-6">

      {/* 1. Header & Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-500" />
          Zone Performance Dashboard
        </h2>
        <div className="flex gap-2">
          <FilterButton label="All" active />
          <FilterButton label="Whitelisted" />
          <FilterButton label="Testing" />
          <FilterButton label="Blocked" />
        </div>
      </div>

      {/* 2. Zone Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Tier</th>
              <th className="px-6 py-3">Zone ID</th>
              <th className="px-6 py-3">Carrier</th>
              <th className="px-6 py-3">Device</th>
              <th className="px-6 py-3">CTR</th>
              <th className="px-6 py-3">Regs</th>
              <th className="px-6 py-3">CPR</th>
              <th className="px-6 py-3">Fraud</th>
              <th className="px-6 py-3">Score</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {zones.map(z => (
              <tr key={z.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4">
                  <TierBadge tier={z.tier} />
                </td>
                <td className="px-6 py-4 font-mono text-zinc-300">#{z.id}</td>
                <td className="px-6 py-4 text-zinc-300">{z.carrier}</td>
                <td className="px-6 py-4 text-zinc-300">{z.device}</td>
                <td className="px-6 py-4 font-mono text-emerald-400 font-bold">{z.ctr}%</td>
                <td className="px-6 py-4 font-mono text-white">{z.regs}</td>
                <td className="px-6 py-4 font-mono text-zinc-300">${z.cpr || '-'}</td>
                <td className="px-6 py-4">
                  <FraudScore score={z.fraud} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${z.score > 0 ? 'bg-indigo-500' : 'bg-red-500'}`} style={{ width: `${Math.abs(z.score)}%` }} />
                    </div>
                    <span className="text-xs font-mono">{z.score}</span>
                  </div>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  {z.status !== 'BLOCKED' && (
                    <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 3. Fraud Detection Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-red-400">
            <ShieldAlert className="w-5 h-5" />
            Fraud Detection & Monitoring
          </h3>

          <div className="space-y-4">
            <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-lg flex gap-4 items-start">
              <Ban className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <p className="font-bold text-red-400">Critical Alert: Zone #88234 Blocked</p>
                <p className="text-sm text-zinc-400 mt-1">
                  Evidence: 8.2% CTR with 0 conversions. 98% bounce rate.
                  Process executed automatically to prevent $120/day waste.
                </p>
              </div>
            </div>

            <div className="bg-amber-900/10 border border-amber-500/20 p-4 rounded-lg flex gap-4 items-start">
              <Eye className="w-5 h-5 text-amber-500 mt-1" />
              <div>
                <p className="font-bold text-amber-400">Monitoring: Zone #66123</p>
                <p className="text-sm text-zinc-400 mt-1">
                  High click volume (234 clicks) but low conversion.
                  Bid automatically reduced by 50%.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
              <div className="text-sm">
                <span className="text-zinc-500">Total Waste Prevented:</span>
                <span className="text-emerald-400 font-bold ml-2">$340 Today</span>
              </div>
              <button className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded">
                View Fraud Report
              </button>
            </div>
          </div>
        </div>

        {/* 4. Geo & Carrier Analysis */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-blue-400" />
            Carrier & Device Performance
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Safaricom (Android)</span>
                <span className="text-emerald-400 font-bold">ROI 285% 🔥</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%]"></div>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Top performing segment. Allocate 70% budget here.</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Airtel (Android)</span>
                <span className="text-emerald-400 font-bold">ROI 162%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[45%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>All iOS Devices</span>
                <span className="text-amber-400 font-bold">ROI 127% ⚠️</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[25%]"></div>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Cost per reg is +60% higher than Android.</p>
            </div>
          </div>
        </div>

      </div>



      {/* 5. Zone Deep Dive Modal */}
      {
        selectedZone && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-800 flex justify-between items-start sticky top-0 bg-zinc-900 z-10">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Map className="w-8 h-8 text-indigo-500" />
                    <h2 className="text-2xl font-bold text-white">Zone #{selectedZone.id}</h2>
                  </div>
                  <p className="text-zinc-400 text-sm flex gap-2">
                    <span>{selectedZone.carrier}</span>
                    <span>•</span>
                    <span>{selectedZone.device}</span>
                    <span>•</span>
                    <TierBadge tier={selectedZone.tier} />
                  </p>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <Ban className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left: Metrics */}
                <div className="md:col-span-2 space-y-8">

                  {/* Score Card */}
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">Zone Quality Score</p>
                      <p className="text-3xl font-bold text-white">{selectedZone.score}/100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Fraud Score</p>
                      <FraudScore score={selectedZone.fraud} />
                    </div>
                  </div>

                  {/* Truth Table */}
                  <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 p-4">
                    <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Propeller vs. Reality</h3>
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-zinc-800/50">
                        <tr className="hover:bg-zinc-900/50">
                          <td className="py-2 text-zinc-400">CTR</td>
                          <td className="py-2 text-right text-emerald-400 font-mono">{selectedZone.ctr}%</td>
                          <td className="py-2 text-right text-zinc-500">Excellent</td>
                        </tr>
                        <tr className="hover:bg-zinc-900/50">
                          <td className="py-2 text-zinc-400">Real Regs</td>
                          <td className="py-2 text-right text-white font-mono">{selectedZone.regs}</td>
                          <td className="py-2 text-right text-zinc-500">Verified</td>
                        </tr>
                        <tr className="hover:bg-zinc-900/50 bg-indigo-900/10">
                          <td className="py-2 text-white">True CPA</td>
                          <td className="py-2 text-right text-emerald-400 font-bold font-mono">${selectedZone.cpr}</td>
                          <td className="py-2 text-right text-indigo-300">Target $15.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Traffic Characteristics */}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Traffic DNA</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                        <span className="text-zinc-500 block text-xs">Browser</span>
                        <span className="text-zinc-300">Chrome Mobile (78%)</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                        <span className="text-zinc-500 block text-xs">Connection</span>
                        <span className="text-zinc-300">4G (89%)</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                        <span className="text-zinc-500 block text-xs">Engagement</span>
                        <span className="text-zinc-300">42s Avg Time</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                        <span className="text-zinc-500 block text-xs">Intent</span>
                        <span className="text-emerald-400">33% Dep. Rate</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right: Actions */}
                <div className="space-y-4">
                  <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl">
                    <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Recommended
                    </h3>
                    <p className="text-sm text-zinc-300 mb-4">
                      Premium zone. Increase bid to capture more volume.
                    </p>
                    <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg mb-2">
                      📈 Increase Bid ($0.75)
                    </button>
                    <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg">
                      🔒 Whitelist Zone
                    </button>
                  </div>

                  <div className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <button className="w-full flex items-center gap-2 p-2 hover:bg-zinc-800 rounded text-sm text-zinc-300">
                      <Eye className="w-4 h-4" /> View Sample Traffic
                    </button>
                    <button className="w-full flex items-center gap-2 p-2 hover:bg-red-900/20 text-red-400 rounded text-sm">
                      <Ban className="w-4 h-4" /> Block Zone
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}

function FilterButton({ label, active }: any) {
  return (
    <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
      {label}
    </button>
  );
}

function TierBadge({ tier }: any) {
  const styles: any = {
    PREMIUM: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    HIGH: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    TEST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    BLOCKED: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold border ${styles[tier]}`}>
      {tier}
    </span>
  );
}

function FraudScore({ score }: any) {
  let color = 'text-emerald-400';
  if (score > 30) color = 'text-amber-400';
  if (score > 60) color = 'text-red-400';
  return <span className={`font-mono font-bold ${color}`}>{score}</span>;
}
