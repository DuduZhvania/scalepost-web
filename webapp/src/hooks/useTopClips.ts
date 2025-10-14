// hooks/useTopClips.ts
import { useState, useEffect } from 'react';

export interface TopClip {
  id: string;
  title: string;
  thumbnail?: string;
  views: number;
  engagement: number;
  platforms: string[];
}

export function useTopClips(): { data: TopClip[]; loading: boolean } {
  const [data, setData] = useState<TopClip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with real API call
    setTimeout(() => {
      setData([
        {
          id: '1',
          title: '5 Secrets to Viral Content',
          thumbnail: undefined,
          views: 125000,
          engagement: 8.4,
          platforms: ['tiktok', 'instagram'],
        },
        {
          id: '2',
          title: 'How I Made $10k in a Month',
          thumbnail: undefined,
          views: 98000,
          engagement: 7.2,
          platforms: ['youtube', 'tiktok'],
        },
        {
          id: '3',
          title: 'The Truth About AI',
          thumbnail: undefined,
          views: 87000,
          engagement: 9.1,
          platforms: ['x', 'instagram'],
        },
        {
          id: '4',
          title: 'Day in My Life as Creator',
          thumbnail: undefined,
          views: 76000,
          engagement: 6.8,
          platforms: ['instagram', 'tiktok'],
        },
        {
          id: '5',
          title: 'Growth Hacks That Actually Work',
          thumbnail: undefined,
          views: 71000,
          engagement: 7.5,
          platforms: ['youtube', 'x'],
        },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  return { data, loading };
}
