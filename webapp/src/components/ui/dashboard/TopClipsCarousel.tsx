// components/ui/dashboard/TopClipsCarousel.tsx
'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Video, MoreHorizontal, ChevronLeft, ChevronRight, ExternalLink, Share2, BarChart3 } from 'lucide-react';
import { type TopClip } from '@/hooks/useTopClips';
import { useTheme } from '@/components/ui/providers/ThemeProvider';

interface TopClipsCarouselProps {
  clips: TopClip[];
}

export function TopClipsCarousel({ clips }: TopClipsCarouselProps) {
  const { theme } = useTheme();
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'tiktok' | 'youtube' | 'instagram' | 'x'>('all');
  const carouselRef = useRef<HTMLDivElement>(null);

  const formatViews = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const platformFilters: { value: typeof selectedPlatform; label: string }[] = [
    { value: 'all', label: 'All Platforms' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'x', label: 'X' },
  ];

  const filteredClips = useMemo(() => {
    if (selectedPlatform === 'all') return clips;
    return clips.filter((clip) => clip.platforms.includes(selectedPlatform));
  }, [clips, selectedPlatform]);

  const scrollByOffset = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const firstCard = carouselRef.current.querySelector<HTMLDivElement>('[data-carousel-card]');
    const cardWidth = firstCard ? firstCard.clientWidth + 16 : 320; // include gap

    carouselRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  const showArrows = filteredClips.length > 1;

  const platformTagStyles: Record<
    'tiktok' | 'youtube' | 'instagram' | 'x',
    { gradient: string; text: string }
  > = {
    tiktok: { gradient: 'from-pink-500 to-cyan-400', text: 'text-white' },
    youtube: { gradient: 'from-red-500 to-red-400', text: 'text-white' },
    instagram: { gradient: 'from-purple-500 to-pink-500', text: 'text-white' },
    x: { gradient: 'from-gray-500 to-slate-400', text: 'text-white' },
  };

  if (clips.length === 0) {
    return (
      <div
        className="relative rounded-2xl p-6 transition-all duration-300 border shadow-sm"
        style={{
          background: theme === 'dark'
            ? '#171717'
            : 'linear-gradient(145deg, rgba(255,255,255,0.75) 0%, rgba(245,247,255,0.75) 100%)',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          boxShadow: theme === 'dark'
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 3px 12px rgba(0,0,0,0.04), inset 0 0 12px rgba(255,255,255,0.5)'
        }}
      >
        <h3 className="mb-4 text-lg font-bold text-gray-900" style={{
          color: theme === 'dark' ? '#fafafa' : undefined
        }}>Top Performing Clips</h3>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 py-12 text-center bg-gray-50/50" style={{
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : undefined,
          background: theme === 'dark' ? 'rgba(10,10,10,0.5)' : undefined
        }}>
          <Video className="h-12 w-12 text-gray-600" style={{
            color: theme === 'dark' ? '#a1a1a1' : undefined
          }} />
          <p className="text-gray-600" style={{
            color: theme === 'dark' ? '#a1a1a1' : undefined
          }}>No clips generated yet</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative animate-fade-in overflow-hidden rounded-2xl p-6 transition-all duration-300 border shadow-sm"
      style={{
        background: theme === 'dark'
          ? '#171717'
          : 'linear-gradient(145deg, rgba(255,255,255,0.75) 0%, rgba(245,247,255,0.75) 100%)',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        boxShadow: theme === 'dark'
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 3px 12px rgba(0,0,0,0.04), inset 0 0 12px rgba(255,255,255,0.5)'
      }}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900" style={{
            color: theme === 'dark' ? '#fafafa' : undefined
          }}>Top Performing Clips</h3>
          <p className="text-sm text-gray-600" style={{
            color: theme === 'dark' ? '#a1a1a1' : undefined
          }}>Your standout stories across every network</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {platformFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedPlatform(filter.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
                selectedPlatform === filter.value
                  ? theme === 'dark'
                    ? 'shadow-sm'
                    : 'border-cyan-500 bg-cyan-100 text-cyan-700 shadow-sm'
                  : theme === 'dark'
                    ? 'border-transparent'
                    : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                background: theme === 'dark' ? (selectedPlatform === filter.value ? '#e5e5e5' : 'transparent') : undefined,
                borderColor: theme === 'dark' ? (selectedPlatform === filter.value ? '#e5e5e5' : 'transparent') : undefined,
                color: theme === 'dark' ? (selectedPlatform === filter.value ? '#171717' : '#fafafa') : undefined
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clips grid */}
      {filteredClips.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 py-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <span>No standout clips for this platform just yet.</span>
          <span className="text-xs text-gray-500 dark:text-gray-500">Adjust filters or distribute fresh content.</span>
        </div>
      ) : (
        <div className="relative group">
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-1 pb-4 pt-1 scrollbar-hide no-scrollbar scroll-smooth"
          >
            {filteredClips.map((clip) => (
              <div
                key={clip.id}
                data-carousel-card
                className="relative shrink-0 snap-start transition-all duration-300"
              >
                <div className="w-[240px] sm:w-[260px] md:w-[280px] lg:w-[320px] xl:w-[340px]">
                  <div className="group/clip relative aspect-[9/16] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-cyan-400/40">
                    {clip.thumbnail ? (
                      <Image
                        src={clip.thumbnail}
                        alt={clip.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/10 to-purple-700/20 text-cyan-200/80">
                        <Video className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 group-hover/clip:opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 transition-opacity duration-300 group-hover/clip:opacity-80" />
                    <div className="absolute top-3 left-3 flex items-center gap-2 text-[11px] text-white/80">
                      <span className="rounded-full border border-white/20 bg-black/50 px-2 py-0.5">
                        {clip.duration ?? '0:30'}
                      </span>
                    </div>
                    <div className="absolute right-3 top-3 opacity-0 transition group-hover/clip:opacity-100">
                      <button
                        type="button"
                        className="rounded-full bg-black/40 p-2 text-gray-200 backdrop-blur-md transition-all duration-300 hover:bg-black/60"
                        aria-label="Quick actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center backdrop-blur-sm opacity-0 transition-all duration-300 group-hover/clip:opacity-100">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:border-cyan-300/40 hover:bg-white/10"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open in Editor
                        </button>
                        <button
                          type="button"
                          className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:border-cyan-300/40 hover:bg-white/10"
                        >
                          <Share2 className="h-3 w-3" />
                          Share
                        </button>
                        <button
                          type="button"
                          className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:border-cyan-300/40 hover:bg-white/10"
                        >
                          <BarChart3 className="h-3 w-3" />
                          View Insights
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-sm font-semibold text-white line-clamp-2 drop-shadow-lg">{clip.title}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
                    <div className="flex items-center gap-2">
                      {clip.platforms.map((platform) => {
                        const style =
                          platformTagStyles[
                            platform as keyof typeof platformTagStyles
                          ] ?? platformTagStyles.x;
                        return (
                          <span
                            key={platform}
                            className={`rounded-full border border-transparent bg-gradient-to-br ${style.gradient} px-2 py-0.5 capitalize transition-all duration-300 ${style.text} shadow-[0_4px_12px_rgba(0,0,0,0.25)]`}
                          >
                            {platform}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">👁️ {formatViews(clip.views)}</span>
                      <span className="flex items-center gap-1">📈 {clip.engagement}% ER</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showArrows && (
            <>
              <button
                type="button"
                onClick={() => scrollByOffset('left')}
                className="absolute -left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white opacity-0 backdrop-blur transition-all duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:flex group-hover:opacity-100"
                aria-label="Scroll clips left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByOffset('right')}
                className="absolute -right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white opacity-0 backdrop-blur transition-all duration-300 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:flex group-hover:opacity-100"
                aria-label="Scroll clips right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
