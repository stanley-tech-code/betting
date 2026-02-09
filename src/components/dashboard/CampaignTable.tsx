
import { CampaignStats } from '@/lib/propeller';

interface Props {
  data: CampaignStats[];
}

export function CampaignTable({ data }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50">
          <tr>
            <th className="px-6 py-3 font-medium">Campaign ID</th>
            <th className="px-6 py-3 font-medium text-right">Impressions</th>
            <th className="px-6 py-3 font-medium text-right">Clicks</th>
            <th className="px-6 py-3 font-medium text-right">Spend</th>
            <th className="px-6 py-3 font-medium text-right">Profit</th>
            <th className="px-6 py-3 font-medium text-right">ROI</th>
          </tr>
        </thead>
        <tbody>
          {data.map((campaign) => {
            const roi = campaign.money_spent > 0 ? ((campaign.profit / campaign.money_spent) * 100).toFixed(2) : '0.00';
            return (
              <tr key={campaign.campaign_id} className="bg-white border-b dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                  {campaign.campaign_id}
                </td>
                <td className="px-6 py-4 text-right text-zinc-500 dark:text-zinc-400">
                  {campaign.impressions.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-zinc-500 dark:text-zinc-400">
                  {campaign.clicks.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-white">
                  ${campaign.money_spent.toFixed(2)}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${campaign.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${campaign.profit.toFixed(2)}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${parseFloat(roi) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
