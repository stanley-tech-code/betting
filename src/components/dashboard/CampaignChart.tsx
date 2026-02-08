
'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CampaignStats } from '@/lib/propeller';

interface Props {
  data: CampaignStats[];
}

export function CampaignChart({ data }: Props) {
  // Aggregate data by date usually, but here if data is per campaign, we might need to process it.
  // Assuming 'data' passed here is already suitable for chart or we process it.
  // For this example, let's assume we want to show Spending vs Revenue per campaign (top 10).

  const formattedData = data
    .sort((a, b) => b.money_spent - a.money_spent) // Top spenders
    .slice(0, 10)
    .map(stat => ({
      name: `ID: ${stat.campaign_id}`,
      Spend: stat.money_spent,
      Revenue: stat.profit + stat.money_spent, // Profit = Rev - Spend (usually). So Rev = Profit + Spend.
      Profit: stat.profit
    }));

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            itemStyle={{ color: '#374151' }}
          />
          <Area type="monotone" dataKey="Spend" stroke="#6366f1" fillOpacity={1} fill="url(#colorSpend)" />
          <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
