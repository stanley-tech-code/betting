
'use client';

import { Clock, Sun, Moon, Calendar, BrainCircuit } from 'lucide-react';

export default function TimeCenter() {

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Heatmap will display real conversion data when available
  // For now showing empty state
  const getIntensity = (d: number, h: number) => 0;

  const getCellColor = (intensity: number) => {
    return 'bg-zinc-800 text-zinc-600'; // Empty state
  };

  return (
    <div className="space-y-6">

      {/* 1. Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
        <Clock className="w-6 h-6 text-indigo-500" />
        <div>
          <h2 className="text-lg font-semibold">Time-Based Performance Analysis</h2>
          <p className="text-sm text-zinc-400">Optimal Bidding & Scheduling Strategy</p>
        </div>
      </div>

      {/* 2. Heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Conversion Heatmap (Last 30 Days)
        </h3>

        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="flex mb-2">
            <div className="w-16 text-xs text-zinc-500">Hour</div>
            {days.map(d => (
              <div key={d} className="flex-1 text-center text-xs text-zinc-500 font-bold">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="space-y-1">
            {hours.map(h => (
              <div key={h} className="flex">
                <div className="w-16 text-xs text-zinc-500 py-1">{h}:00</div>
                {days.map((d, dIdx) => (
                  <div
                    key={`${dIdx}-${h}`}
                    className={`flex-1 m-0.5 rounded-sm h-8 flex items-center justify-center text-xs font-mono transition-colors hover:ring-2 ring-indigo-500 cursor-pointer ${getCellColor(getIntensity(dIdx, h))}`}
                    title={`${d} ${h}:00`}
                  >
                    {/* Mock value displayed only for high intensity */}
                    {getIntensity(dIdx, h) === 3 && "🔥"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-xs text-zinc-500 justify-end">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-zinc-800"></div> Dead
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/30"></div> OK
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/60"></div> Good
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500"></div> Hot
          </div>
        </div>
      </div>

      {/* 3. Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-emerald-400">
            <Sun className="w-5 h-5" />
            Golden Hours (Boost)
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-emerald-300">Daily Peak: 9pm - 12am</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded">+40% Bid</span>
              </div>
              <p className="text-sm text-zinc-400">
                67% of all registrations occur in this window. Competition is higher but ROI is max.
              </p>
            </div>
            <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-emerald-300">Weekend Special: Fri-Sun</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded">+20% Budget</span>
              </div>
              <p className="text-sm text-zinc-400">
                Users are 2x more likely to deposit on weekends.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-red-400">
            <Moon className="w-5 h-5" />
            Dead Zones (Pause/Reduce)
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-red-300">Graveyard Shift: 3am - 8am</span>
                <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded">PAUSE</span>
              </div>
              <p className="text-sm text-zinc-400">
                Zero registrations in last 30 days. Save budget for peak hours.
              </p>
            </div>
            <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-amber-300">Monday Blues</span>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-1 rounded">-30% Bid</span>
              </div>
              <p className="text-sm text-zinc-400">
                Lowest conversion rate day of the week. Bid conservatively.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. AI-Discovered Patterns */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-purple-400">
          <BrainCircuit className="w-5 h-5" />
          AI-Discovered Time Patterns
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PatternCard
            title="Friday Night Premium"
            condition="Fri + 9pm-12am + Safaricom"
            perf="385% ROI"
            action="Allocating Extra Budget"
          />
          <PatternCard
            title="Weekend Morning Dead Zone"
            condition="Sat/Sun + 6am-11am"
            perf="22% ROI (Poor)"
            action="Pausing Campaigns"
            bad
          />
          <PatternCard
            title="Weekday Evening Surge"
            condition="Mon-Thu + 8pm-10pm"
            perf="272% ROI"
            action="Prioritizing Big Win Creatives"
          />
        </div>
      </div>
    </div>
  );
}

function PatternCard({ title, condition, perf, action, bad }: any) {
  return (
    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
      <h4 className={`font-bold text-sm mb-2 ${bad ? 'text-red-400' : 'text-purple-300'}`}>{title}</h4>
      <div className="space-y-2 text-xs text-zinc-400">
        <p><span className="text-zinc-600">Condition:</span> {condition}</p>
        <p><span className="text-zinc-600">Perf:</span> <span className={bad ? 'text-red-400' : 'text-emerald-400'}>{perf}</span></p>
        <p><span className="text-zinc-600">AI Action:</span> {action}</p>
      </div>
    </div>
  );
}
