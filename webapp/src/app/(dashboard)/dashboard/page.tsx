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

const TIMEFRAME_OPTIONS: { value: Range; label: string }[] = [
  { value: 'day', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last 12 Months' },
  { value: 'all', label: 'All Time' },
];

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('month');
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
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
        {/* Title Row */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-cyan-300/80">
              <Sparkles className="h-3 w-3" />
              Vulgo Control Center
            </div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back! Here&apos;s your content performance overview.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300 transition hover:border-cyan-300/60 hover:text-white">
              <CalendarDays className="h-4 w-4 text-cyan-300" />
              <select
                className="bg-transparent text-sm font-medium transition-all duration-300 focus:outline-none"
                value={range}
                onChange={(event) => setRange(event.target.value as Range)}
              >
                {TIMEFRAME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-zinc-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-200 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-cyan-300/60 dark:hover:bg-white/[0.08]"
            >
              <Video className="h-4 w-4" />
              Create Video
            </Link>
            <Link
              href="/campaigns"
              className="distribute-glow relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-fuchsia-500 dark:hover:from-cyan-300 dark:hover:via-blue-300 dark:hover:to-fuchsia-400"
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
                className="h-[140px] animate-pulse rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-200 dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
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

        {/* Quick Actions */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-cyan-300/40 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="pointer-events-none absolute inset-0 opacity-60 transition-all duration-300 group-hover:opacity-80 dark:opacity-0">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 via-transparent to-purple-100 dark:from-cyan-400/10 dark:to-purple-500/10" />
          </div>
          <div className="relative mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-wide text-gray-800 transition-colors duration-200 dark:text-gray-300">Quick Actions</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">Stay agile with your next move</span>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-cyan-600 transition-all duration-300 hover:border-cyan-300/60 hover:bg-cyan-50 hover:text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/15 dark:hover:text-white sm:w-auto sm:flex-1"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-base text-cyan-600 transition-all duration-300 group-hover:bg-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-200 dark:group-hover:bg-cyan-400/30">
                    {action.emoji}
                  </span>
                  <span className="relative transition-all duration-300 group-hover:text-cyan-700 dark:group-hover:text-white">
                    {action.label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full scale-x-0 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 opacity-0 transition-transform duration-300 group-hover:scale-x-100 group-hover:opacity-100 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-500" />
                  </span>
                </span>
                <span className="text-xs uppercase tracking-widest text-cyan-600 transition-all duration-300 group-hover:text-cyan-700 dark:text-cyan-200/70 dark:group-hover:text-white">
                  Go
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {seriesLoading ? (
            <div className="h-[360px] animate-pulse rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-200 dark:border-white/5 dark:bg-white/[0.05]" />
          ) : (
            <PerformanceChart
              data={seriesData}
              range={range}
              onRangeChange={setRange}
            />
          )}

          {/* Recent Activity Feed */}
          <div className="relative flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Live updates across the team</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-600 transition-colors duration-200 dark:text-cyan-300">
                <span className="flex h-2.5 w-2.5 items-center justify-center">
                  <span className="live-pulse-dot" />
                </span>
                Live
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {recentActivity.map((item) => (
                <div
                  key={`${item.message}-${item.time}`}
                  className="flex items-start gap-3 rounded-xl border border-transparent bg-gray-50 p-3 opacity-0 shadow-sm transition-all duration-300 animate-[fadeInUp_0.4s_ease_forwards] hover:border-cyan-200 hover:bg-white dark:border-transparent dark:bg-white/[0.04] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] dark:hover:border-cyan-300/30"
                >
                  {(() => {
                    const platformStyle =
                      activityPlatformStyles[
                        item.platform as keyof typeof activityPlatformStyles
                      ] ?? activityPlatformStyles.campaigns;
                    return (
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${platformStyle.gradient} text-xs font-semibold text-white shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]`}
                      >
                        {platformStyle.icon}
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 transition-colors duration-200 dark:text-gray-200">{item.message}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
