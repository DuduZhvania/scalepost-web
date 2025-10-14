// components/ui/dashboard/TopClipsCarousel.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Video, Eye, TrendingUp, ExternalLink, Send } from 'lucide-react';
import { PlatformBadge } from '../PlatformBadge';
import { type TopClip } from '@/hooks/useTopClips';

interface TopClipsCarouselProps {
  clips: TopClip[];
}

export function TopClipsCarousel({ clips }: TopClipsCarouselProps) {
  const formatViews = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (clips.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Top Performing Clips</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Video className="w-12 h-12 text-gray-700 mb-3" />
          <p className="text-gray-500">No clips generated yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Top Performing Clips</h3>
        <button className="text-sm text-gray-400 hover:text-white transition">
          View All
        </button>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className="flex-shrink-0 w-72 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden hover:border-zinc-600 transition group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center">
              {clip.thumbnail ? (
                <Image
                  src={clip.thumbnail}
                  alt={clip.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-700">
                  <Video className="w-12 h-12" />
                  <span className="text-xs">No thumbnail</span>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold">
                #{index + 1}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="font-semibold mb-3 line-clamp-2">{clip.title}</h4>

              {/* Platforms */}
              <div className="flex gap-2 mb-3">
                {clip.platforms.map((platform) => (
                  <PlatformBadge
                    key={platform}
                    platform={platform as 'tiktok' | 'youtube' | 'instagram' | 'x'}
                    size="sm"
                  />
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(clip.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{clip.engagement}% ER</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs font-medium hover:bg-zinc-950 transition">
                  <ExternalLink className="w-3 h-3" />
                  Open in Editor
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-black rounded text-xs font-medium hover:bg-gray-100 transition">
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
