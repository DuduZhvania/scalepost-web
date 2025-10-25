// hooks/useAccounts.ts
import { useState, useEffect } from 'react';

export type AccountStatus = 'active' | 'needs_reauth' | 'rate_limited' | 'error';

export interface Account {
  id: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'x';
  handle: string;
  avatar?: string;
  status: AccountStatus;
  group?: string;
  tags?: string[];
  lastSync: string;
}

export function useAccounts(platform?: string): { data: Account[]; loading: boolean } {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts');
        if (!response.ok) {
          throw new Error('Failed to fetch accounts');
        }
        
        const result = await response.json();
        const allAccounts: Account[] = result.accounts || [];
        
        const filtered = platform
          ? allAccounts.filter((acc) => acc.platform === platform)
          : allAccounts;

        setData(filtered);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [platform]);

  return { data, loading };
}
