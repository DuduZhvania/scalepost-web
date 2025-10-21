// hooks/useDashboardKpis.ts
import { useState, useEffect } from 'react';

export interface DashboardKpis {
  activeCampaigns: number;
  postsPublished: number;
  activeAccounts: number;
  totalViews: number;
  avgEngagementRate: number;
  timeframeLabel: string;
}

export function useDashboardKpis(): { data: DashboardKpis | null; loading: boolean } {
  const [data, setData] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with real API call
    setTimeout(() => {
      setData({
        activeCampaigns: 3,
        postsPublished: 127,
        activeAccounts: 8,
        totalViews: 45200,
        avgEngagementRate: 5.4,
        timeframeLabel: 'Last 30 Days',
      });
      setLoading(false);
    }, 300);
  }, []);

  return { data, loading };
}
