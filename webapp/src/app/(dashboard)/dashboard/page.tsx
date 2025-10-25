// app/(dashboard)/dashboard/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Video, Send, CalendarDays, Sparkles } from 'lucide-react';
import { StatCard } from '@/components/ui/dashboard/StatCard';
import { PerformanceChart } from '@/components/ui/dashboard/PerformanceChart';
import { TopClipsCarousel } from '@/components/ui/dashboard/TopClipsCarousel';
import { useDashboardKpis } from '@/hooks/useDashboardKpis';
import { usePerformanceSeries, type Range } from '@/hooks/usePerformanceSeries';
import { useTopClips } from '@/hooks/useTopClips';
import { useTheme } from '@/components/ui/providers/ThemeProvider';

const TIMEFRAME_OPTIONS: { value: Range; label: string }[] = [
  { value: 'day', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last 12 Months' },
  { value: 'all', label: 'All Time' },
];

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('month');
  const { theme } = useTheme();
  const { data: kpis, loading: kpisLoading } = useDashboardKpis();
  const { data: seriesData, loading: seriesLoading } = usePerformanceSeries(range);
  const { data: topClips, loading: clipsLoading } = useTopClips();

  const selectedTimeframeLabel = useMemo(() => {
    return (
      TIMEFRAME_OPTIONS.find((option) => option.value === range)?.label ??
      kpis?.timeframeLabel ??
      'Last 30 Days'
    );
  }, [kpis?.timeframeLabel, range]);

  const recentActivity = [
    { message: 'Video uploaded by Alicia Keys', time: '2m ago', platform: 'tiktok' },
    { message: 'Campaign “Summer Launch” started', time: '15m ago', platform: 'campaigns' },
    { message: 'Clip posted to TikTok', time: '1h ago', platform: 'tiktok' },
    { message: 'YouTube highlights pushed live', time: '2h ago', platform: 'youtube' },
    { message: 'Instagram analytics refreshed', time: '3h ago', platform: 'instagram' },
  ];

  const formatValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const getDelta = (delta?: number) => {
    if (delta === undefined) return { value: undefined as string | undefined, trend: 'neutral' as const };
    const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
    const formatted = `${delta > 0 ? '+' : ''}${delta}%`;
    return { value: formatted, trend };
  };

  const deltaActiveCampaigns = getDelta(12);
  const deltaPostsPublished = getDelta(8);
  const deltaTotalViews = getDelta(15);

  const quickActions = [
    {
      label: 'Upload New',
      href: '/library?modal=upload',
      emoji: '📤',
    },
    {
      label: 'Launch Campaign',
      href: '/campaigns',
      emoji: '🚀',
    },
    {
      label: 'Generate Clips',
      href: '/studio?tab=clips',
      emoji: '✂️',
    },
  ];

  const activityPlatformStyles: Record<
    'tiktok' | 'youtube' | 'instagram' | 'x' | 'campaigns',
    { label: string; gradient: string; icon: string }
  > = {
    tiktok: { label: 'TikTok', gradient: 'from-pink-500 to-cyan-400', icon: '🎵' },
    youtube: { label: 'YouTube', gradient: 'from-red-500 to-red-400', icon: '▶️' },
    instagram: { label: 'Instagram', gradient: 'from-purple-500 to-pink-500', icon: '📸' },
    x: { label: 'X', gradient: 'from-gray-500 to-slate-300', icon: '✖️' },
    campaigns: { label: 'Campaign', gradient: 'from-emerald-500 to-emerald-300', icon: '🚀' },
  };

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-200" style={{
      background: theme === 'dark' ? '#0a0a0a' : 'linear-gradient(145deg, #e8e5ff 0%, #f0f4ff 35%, #f7f9ff 100%)',
      color: theme === 'dark' ? '#fafafa' : undefined
    }}>
      {/* Main Content */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
        {/* Title Row */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 w-fit" style={{
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : undefined,
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : undefined,
              color: theme === 'dark' ? '#a1a1a1' : undefined
            }}>
              <Sparkles className="h-3 w-3" />
              Vulgo Control Center
            </div>
            <h1 className="text-3xl font-semibold text-gray-900" style={{
              color: theme === 'dark' ? '#fafafa' : undefined
            }}>Dashboard</h1>
            <p className="text-gray-600" style={{
              color: theme === 'dark' ? '#a1a1a1' : undefined
            }}>
              Welcome back! Here&apos;s your content performance overview.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all duration-300 hover:shadow-md bg-white/80 border border-gray-200 text-gray-900" style={{
              background: theme === 'dark' ? '#171717' : undefined,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : undefined,
              color: theme === 'dark' ? '#fafafa' : undefined
            }}>
              <CalendarDays className="h-4 w-4 text-gray-600" style={{
                color: theme === 'dark' ? '#a1a1a1' : undefined
              }} />
              <select
                className="bg-transparent text-sm font-medium transition-all duration-300 focus:outline-none text-gray-900"
                value={range}
                onChange={(event) => setRange(event.target.value as Range)}
                style={{
                  color: theme === 'dark' ? '#fafafa' : undefined
                }}
              >
                {TIMEFRAME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} style={{
                    background: theme === 'dark' ? '#171717' : '#ffffff',
                    color: theme === 'dark' ? '#fafafa' : '#111827'
                  }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-white border border-gray-300 shadow-sm text-gray-900"
              style={{
                background: theme === 'dark' ? '#e5e5e5' : undefined,
                color: theme === 'dark' ? '#171717' : undefined,
                borderColor: theme === 'dark' ? 'transparent' : undefined
              }}
            >
              <Video className="h-4 w-4" />
              Create Video
            </Link>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 shadow-md"
              style={{
                background: theme === 'dark' ? '#e5e5e5' : 'linear-gradient(to right, rgb(147 51 234), rgb(6 182 212))',
                color: theme === 'dark' ? '#171717' : undefined
              }}
            >
              <Send className="h-4 w-4" />
              Distribute
            </Link>
          </div>
        </div>

        {/* KPI Strip */}
        {kpisLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[120px] animate-pulse rounded-2xl transition-all duration-200 bg-white/75 dark:bg-black border border-gray-200/50 dark:border-white/20 shadow-sm dark:shadow-2xl dark:shadow-black/30 backdrop-blur-sm"
              />
            ))}
          </div>
        ) : (
          kpis && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Active Campaigns"
                value={formatValue(kpis.activeCampaigns)}
                timeframe={selectedTimeframeLabel}
                delta={deltaActiveCampaigns.value}
                deltaTrend={deltaActiveCampaigns.trend as 'up' | 'down' | 'neutral'}
                icon={<span aria-hidden>📊</span>}
                tooltip="Currently running campaigns"
              />
              <StatCard
                label="Posts Published"
                value={formatValue(kpis.postsPublished)}
                timeframe={selectedTimeframeLabel}
                delta={deltaPostsPublished.value}
                deltaTrend={deltaPostsPublished.trend as 'up' | 'down' | 'neutral'}
                icon={<span aria-hidden>🎬</span>}
                tooltip="Posts published this month"
              />
              <StatCard
                label="Active Accounts"
                value={formatValue(kpis.activeAccounts)}
                timeframe={selectedTimeframeLabel}
                icon={<span aria-hidden>👥</span>}
                tooltip="Connected and healthy accounts"
              />
              <StatCard
                label="Total Views"
                value={formatValue(kpis.totalViews)}
                timeframe={selectedTimeframeLabel}
                delta={deltaTotalViews.value}
                deltaTrend={deltaTotalViews.trend as 'up' | 'down' | 'neutral'}
                icon={<span aria-hidden>👁️</span>}
                tooltip="Total views this month"
              />
            </div>
          )
        )}

        {/* Performance Chart */}
        <div className="w-full">
          {seriesLoading ? (
            <div className="h-[360px] animate-pulse rounded-2xl transition-colors duration-200 bg-gray-100 shadow-sm" style={{
              background: theme === 'dark' ? '#171717' : undefined,
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : undefined,
              boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : undefined
            }} />
          ) : (
            <PerformanceChart
              data={seriesData}
              range={range}
              onRangeChange={setRange}
            />
          )}
        </div>

        {/* Top Clips Carousel */}
        {clipsLoading ? (
          <div className="h-64 animate-pulse rounded-2xl border border-white/5 bg-white/[0.04]" />
        ) : (
          <TopClipsCarousel clips={topClips} />
        )}
      </div>
    </div>
  );
}
