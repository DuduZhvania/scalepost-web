'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { type Range, type SeriesPoint } from '@/hooks/usePerformanceSeries';

interface PerformanceChartProps {
  data: SeriesPoint[];
  range: Range;
  onRangeChange: (range: Range) => void;
}

export function PerformanceChart({ data, range, onRangeChange }: PerformanceChartProps) {
  const [visiblePlatforms, setVisiblePlatforms] = useState<Set<string>>(
    new Set(['tiktok', 'youtube', 'instagram', 'x'])
  );

  const togglePlatform = (platform: string) => {
    const newSet = new Set(visiblePlatforms);
    if (newSet.has(platform)) {
      newSet.delete(platform);
    } else {
      newSet.add(platform);
    }
    setVisiblePlatforms(newSet);
  };

  const ranges: { value: Range; label: string }[] = [
    { value: 'day', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' },
  ];

  const platforms = [
    { key: 'tiktok', label: 'TikTok', color: '#FF0050' },
    { key: 'youtube', label: 'YouTube', color: '#FF0000' },
    { key: 'instagram', label: 'Instagram', color: '#E1306C' },
    { key: 'x', label: 'X', color: '#1DA1F2' },
  ];

  // Prepare chart data
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      date: new Date(point.ts).getTime(), // Use timestamp for XAxis
    }));
  }, [data]);

  // Calculate max value for Y domain
  const maxValue = useMemo(() => {
    const allValues = data.flatMap((point) =>
      Object.entries(point)
        .filter(([key]) => key !== 'ts' && visiblePlatforms.has(key))
        .map(([, value]) => value as number)
    );
    return Math.max(...allValues, 1000);
  }, [data, visiblePlatforms]);

  const formatValue = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatXTick = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (range) {
      case 'day':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short' });
      case 'all':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      default:
        return '';
    }
  };

  const formatTooltipLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: range === 'all' ? 'numeric' : undefined,
    });
  };

  type TooltipEntry = {
    value?: number;
    color?: string;
    dataKey?: string | number;
    name?: string;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipContentProps<number, string>) => {
    if (!active || !payload || payload.length === 0 || typeof label !== 'number') {
      return null;
    }

    return (
      <div className="min-w-[180px] rounded-lg border border-zinc-700 bg-zinc-950 p-3 shadow-xl">
        <div className="mb-2 text-xs text-gray-400">{formatTooltipLabel(label)}</div>
        {(payload as TooltipEntry[]).map((entry) => {
          if (!entry || typeof entry.value !== 'number') return null;

          return (
            <div key={entry.dataKey?.toString()} className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? '#fff' }} />
                <span className="text-xs text-gray-300">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold">{formatValue(entry.value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Performance Overview</h3>
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => onRangeChange(r.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded transition ${
                range === r.value ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXTick}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              interval={range === 'month' || range === 'all' ? 'preserveStartEnd' : 0}
              axisLine={{ stroke: '#27272a' }}
              tickLine={{ stroke: '#27272a' }}
            />
            <YAxis
              domain={[0, Math.ceil(maxValue / 1000) * 1000]}
              tickFormatter={formatValue}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#27272a' }}
              tickLine={{ stroke: '#27272a' }}
            />
            <Tooltip
              content={(props: TooltipContentProps<number, string>) => (
                <CustomTooltip {...props} />
              )}
            />
            {platforms
              .filter((p) => visiblePlatforms.has(p.key))
              .map((platform) => (
                <Line
                  key={platform.key}
                  type="monotone"
                  dataKey={platform.key}
                  stroke={platform.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#000', strokeWidth: 1 }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-zinc-800">
        {platforms.map((platform) => (
          <button
            key={platform.key}
            onClick={() => togglePlatform(platform.key)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition ${
              visiblePlatforms.has(platform.key)
                ? 'bg-white/10 border-2 text-white'
                : 'bg-zinc-800 border-2 border-transparent text-gray-500'
            }`}
            style={{
              borderColor: visiblePlatforms.has(platform.key) ? platform.color : 'transparent',
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.color }} />
            {platform.label}
          </button>
        ))}
      </div>
    </div>
  );
}
