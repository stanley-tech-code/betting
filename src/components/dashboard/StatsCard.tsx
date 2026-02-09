
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, subValue, trend, trendValue, className }: StatsCardProps) {
  return (
    <div className={cn("bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>

        {(subValue || trendValue) && (
          <div className="flex items-center text-xs">
            {trendValue && (
              <span className={cn(
                "font-medium mr-2",
                trend === 'up' ? "text-green-600 dark:text-green-400" :
                  trend === 'down' ? "text-red-600 dark:text-red-400" : "text-zinc-500"
              )}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
              </span>
            )}
            {subValue && <span className="text-zinc-500 dark:text-zinc-400">{subValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
