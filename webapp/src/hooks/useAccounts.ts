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
    // Mock data for now - replace with real API call
    setTimeout(() => {
      const allAccounts: Account[] = [
        {
          id: '1',
          platform: 'tiktok',
          handle: '@scalepost_main',
          status: 'active',
          group: 'Main Brand',
          tags: ['primary'],
          lastSync: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          id: '2',
          platform: 'tiktok',
          handle: '@scalepost_backup',
          status: 'active',
          group: 'Backups',
          lastSync: new Date(Date.now() - 15 * 60000).toISOString(),
        },
        {
          id: '3',
          platform: 'tiktok',
          handle: '@scalepost_test',
          status: 'needs_reauth',
          group: 'Testing',
          lastSync: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
        },
        {
          id: '4',
          platform: 'youtube',
          handle: '@ScalepostOfficial',
          status: 'active',
          group: 'Main Brand',
          tags: ['primary', 'shorts'],
          lastSync: new Date(Date.now() - 10 * 60000).toISOString(),
        },
        {
          id: '5',
          platform: 'youtube',
          handle: '@ScalepostClips',
          status: 'active',
          group: 'Main Brand',
          lastSync: new Date(Date.now() - 20 * 60000).toISOString(),
        },
        {
          id: '6',
          platform: 'instagram',
          handle: '@scalepost',
          status: 'active',
          group: 'Main Brand',
          tags: ['primary', 'reels'],
          lastSync: new Date(Date.now() - 8 * 60000).toISOString(),
        },
        {
          id: '7',
          platform: 'instagram',
          handle: '@scalepost.tips',
          status: 'rate_limited',
          group: 'Content',
          lastSync: new Date(Date.now() - 60 * 60000).toISOString(),
        },
        {
          id: '8',
          platform: 'x',
          handle: '@scalepost',
          status: 'active',
          group: 'Main Brand',
          tags: ['primary'],
          lastSync: new Date(Date.now() - 3 * 60000).toISOString(),
        },
      ];

      const filtered = platform
        ? allAccounts.filter((acc) => acc.platform === platform)
        : allAccounts;

      setData(filtered);
      setLoading(false);
    }, 300);
  }, [platform]);

  return { data, loading };
}
