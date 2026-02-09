'use client';

import LandingStats from '@/components/dashboard/LandingStats';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Landing Page Analytics</h1>
          <LandingStats />
        </div>
      </main>
    </div>
  );
}
