// hooks/useTopClips.ts
import { useState, useEffect } from 'react';

export interface TopClip {
  id: string;
  title: string;
  thumbnail?: string;
  views: number;
  engagement: number;
  platforms: string[];
  description?: string;
  duration?: string;
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
          thumbnail: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=640&q=80',
          views: 125000,
          engagement: 8.4,
          platforms: ['tiktok', 'instagram'],
          description: 'Fast-paced breakdown of viral storytelling frameworks driving creator growth.',
          duration: '00:48',
        },
        {
          id: '2',
          title: 'How I Made $10k in a Month',
          thumbnail: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=640&q=80',
          views: 98000,
          engagement: 7.2,
          platforms: ['youtube', 'tiktok'],
          description: 'Monetisation deep dive with step-by-step funnel strategy and retention tactics.',
          duration: '01:12',
        },
        {
          id: '3',
          title: 'The Truth About AI',
          thumbnail: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=640&q=80',
          views: 87000,
          engagement: 9.1,
          platforms: ['x', 'instagram'],
          description: 'Honest perspective on AI co-creation and how Vulgo automates distribution.',
          duration: '00:56',
        },
        {
          id: '4',
          title: 'Day in My Life as Creator',
          thumbnail: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=640&q=80',
          views: 76000,
          engagement: 6.8,
          platforms: ['instagram', 'tiktok'],
          description: 'Creator diary showcasing streamlined workflow with Vulgo Quick Actions.',
          duration: '00:42',
        },
        {
          id: '5',
          title: 'Growth Hacks That Actually Work',
          thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=640&q=80',
          views: 71000,
          engagement: 7.5,
          platforms: ['youtube', 'x'],
          description: 'Tested hooks and split testing frameworks delivering compounding traction.',
          duration: '00:51',
        },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  return { data, loading };
}
