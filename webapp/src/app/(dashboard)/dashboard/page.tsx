// app/(dashboard)/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Video, Send } from 'lucide-react';
import { KpiCard } from '@/components/ui/dashboard/KpiCard';
import { PerformanceChart } from '@/components/ui/dashboard/PerformanceChart';
import { TopClipsCarousel } from '@/components/ui/dashboard/TopClipsCarousel';
import { useDashboardKpis } from '@/hooks/useDashboardKpis';
import { usePerformanceSeries, type Range } from '@/hooks/usePerformanceSeries';
import { useTopClips } from '@/hooks/useTopClips';

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('month');
  const { data: kpis, loading: kpisLoading } = useDashboardKpis();
  const { data: seriesData, loading: seriesLoading } = usePerformanceSeries(range);
  const { data: topClips, loading: clipsLoading } = useTopClips();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Row */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back! Here&apos;s your content performance overview.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-800 transition"
            >
              <Video className="w-4 h-4" />
              Create Video
            </Link>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
            >
              <Send className="w-4 h-4" />
              Distribute
            </Link>
          </div>
        </div>

        {/* KPI Strip */}
        {kpisLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : (
          kpis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KpiCard
                title="Active Campaigns"
                value={kpis.activeCampaigns}
                delta={12}
                tooltip="Currently running campaigns"
              />
              <KpiCard
                title="Posts Published"
                value={kpis.postsPublished}
                delta={8}
                tooltip="Posts published this month"
              />
              <KpiCard
                title="Active Accounts"
                value={kpis.activeAccounts}
                tooltip="Connected and healthy accounts"
              />
              <KpiCard
                title="Total Views"
                value={kpis.totalViews}
                delta={15}
                tooltip="Total views this month"
              />
            </div>
          )
        )}

        {/* Performance Chart */}
        {seriesLoading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-96 mb-8 animate-pulse" />
        ) : (
          <div className="mb-8">
            <PerformanceChart
              data={seriesData}
              range={range}
              onRangeChange={setRange}
            />
          </div>
        )}

        {/* Top Clips Carousel */}
        {clipsLoading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-64 animate-pulse" />
        ) : (
          <TopClipsCarousel clips={topClips} />
        )}
      </div>
    </div>
  );
}
