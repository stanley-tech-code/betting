
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, MousePointer2 } from 'lucide-react';

export function DashboardNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'PropellerAds', href: '/dashboard', icon: BarChart3 },
    { name: 'Landing Page', href: '/landing', icon: MousePointer2 },
  ];

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  inline-flex items-center px-1 pt-4 pb-3 border-b-2 text-sm font-medium transition-colors
                  ${isActive
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
