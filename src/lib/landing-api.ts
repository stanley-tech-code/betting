// API client for landing page analytics
// Uses local API route to avoid CORS issues

export interface LandingPageStats {
  today: {
    visits: number;
    clicks: number;
    ctr: string;
  };
  growth: {
    visits: string;
    clicks: string;
  };
}

export interface LandingPageHistory {
  labels: string[];
  datasets: {
    visits: number[];
  };
}

export async function getLandingPageStats(): Promise<LandingPageStats> {
  try {
    const res = await fetch('/api/landing-stats?action=dashboard-summary', {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Failed to fetch landing page stats');
      return {
        today: { visits: 0, clicks: 0, ctr: '0%' },
        growth: { visits: '0%', clicks: '0%' }
      };
    }

    return await res.json();
  } catch (error) {
    console.error('Landing page stats error:', error);
    return {
      today: { visits: 0, clicks: 0, ctr: '0%' },
      growth: { visits: '0%', clicks: '0%' }
    };
  }
}

export async function getLandingPageHistory(): Promise<LandingPageHistory> {
  try {
    const res = await fetch('/api/landing-stats?action=history', {
      cache: 'no-store'
    });

    if (!res.ok) {
      return { labels: [], datasets: { visits: [] } };
    }

    return await res.json();
  } catch (error) {
    console.error('Landing page history error:', error);
    return { labels: [], datasets: { visits: [] } };
  }
}
