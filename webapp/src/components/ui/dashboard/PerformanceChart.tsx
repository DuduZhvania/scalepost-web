'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { useTheme } from '@/components/ui/providers/ThemeProvider';
import { type Range, type SeriesPoint } from '@/hooks/usePerformanceSeries';

const BASE_PLATFORMS = [
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'x', label: 'X' },
] as const;

const LIGHT_COLORS: Record<(typeof BASE_PLATFORMS)[number]['key'], string> = {
  tiktok: '#FF0050',
  youtube: '#CC0000',
  instagram: '#C13584',
  x: '#1DA1F2',
};

const DARK_COLORS: Record<(typeof BASE_PLATFORMS)[number]['key'], string> = {
  tiktok: '#22d3ee',
  youtube: '#6366f1',
  instagram: '#a855f7',
  x: '#475569',
};

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: 'day', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All Time' },
];

type TooltipEntry = {
  value?: number;
  color?: string;
  dataKey?: string | number;
  name?: string;
};

interface PerformanceChartProps {
  data: SeriesPoint[];
  range: Range;
  onRangeChange: (range: Range) => void;
}

export function PerformanceChart({ data, range, onRangeChange }: PerformanceChartProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [visiblePlatforms, setVisiblePlatforms] = useState<Set<string>>(
    () => new Set(BASE_PLATFORMS.map((platform) => platform.key))
  );

  const platforms = useMemo(
    () =>
      BASE_PLATFORMS.map((platform) => ({
        ...platform,
        color: (isLight ? LIGHT_COLORS : DARK_COLORS)[platform.key],
      })),
    [isLight]
  );

  const togglePlatform = (platform: string) => {
    const next = new Set(visiblePlatforms);
    if (next.has(platform)) {
      next.delete(platform);
    } else {
      next.add(platform);
    }
    setVisiblePlatforms(next);
  };

  const chartData = useMemo(() => {
    const numericKeys = platforms.map((platform) => platform.key);

    return data.map((point) => {
      const average =
        numericKeys.reduce((acc, key) => {
          const value = point[key as keyof SeriesPoint];
          return acc + (typeof value === 'number' ? value : 0);
        }, 0) / numericKeys.length;

      return {
        ...point,
        date: new Date(point.ts).getTime(),
        average,
      };
    });
  }, [data, platforms]);

  const maxValue = useMemo(() => {
    const platformValues = chartData.flatMap((point) =>
      platforms
        .filter((platform) => visiblePlatforms.has(platform.key))
        .map((platform) => {
          const value = point[platform.key as keyof typeof point];
          return typeof value === 'number' ? value : 0;
        })
    );

    const averageValues = chartData.map((point) =>
      typeof point.average === 'number' ? point.average : 0
    );

    return Math.max(...platformValues, ...averageValues, 1000);
  }, [chartData, visiblePlatforms, platforms]);

  const formatValue = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
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

  const CustomTooltip = ({ active, payload, label }: TooltipContentProps<number, string>) => {
    if (!active || !payload || payload.length === 0 || typeof label !== 'number') {
      return null;
    }

    return (
      <div
        className={clsx(
          'min-w-[200px] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-colors duration-200',
          isLight ? 'border-gray-200 bg-white text-gray-800' : 'border-cyan-400/30 bg-slate-950/90 text-gray-200'
        )}
      >
        <div
          className={clsx(
            'mb-3 text-xs font-medium uppercase tracking-wide',
            isLight ? 'text-cyan-600' : 'text-cyan-200'
          )}
        >
          {formatTooltipLabel(label)}
        </div>
        {(payload as TooltipEntry[]).map((entry) => {
          if (!entry || typeof entry.value !== 'number') return null;

          const isAverage = entry.dataKey === 'average';

          return (
            <div
              key={entry.dataKey?.toString()}
              className="flex items-center justify-between gap-4 rounded-lg px-2 py-1.5 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: isAverage ? '#38bdf8' : entry.color ?? '#38bdf8',
                    opacity: isAverage ? 0.7 : 1,
                  }}
                />
                <span className={clsx('text-xs', isLight ? 'text-gray-500' : 'text-gray-400')}>
                  {isAverage ? 'Average' : (entry.name as string)}
                </span>
              </div>
              <span className={clsx('font-semibold', isLight ? 'text-gray-800' : 'text-white')}>
                {formatValue(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const gradientTop = isLight ? 'rgba(99,102,241,0.14)' : 'rgba(56,189,248,0.25)';
  const gradientBottom = isLight ? 'rgba(226,232,240,0)' : 'rgba(15,23,42,0)';

  return (
    <div className="animate-fade-in group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm transition-all duration-300 hover:border-cyan-300/40 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:shadow-[0_30px_120px_-60px_rgba(56,189,248,0.65)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-60 dark:opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_60%)]" />
      </div>

      <div className="relative mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">Performance Overview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time resonance across TikTok, YouTube, Instagram, and X
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 p-1 transition-colors duration-200 dark:border-white/10 dark:bg-white/[0.05]">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onRangeChange(option.value)}
              className={clsx(
                'rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-300',
                range === option.value
                  ? isLight
                    ? 'bg-gray-900 text-white shadow'
                    : 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-lg shadow-cyan-500/40'
                  : isLight
                    ? 'text-gray-500 hover:bg-white hover:text-gray-900'
                    : 'text-gray-400 hover:bg-white/[0.08] hover:text-white'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 4, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="gridGlow" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={gradientTop} />
                <stop offset="100%" stopColor={gradientBottom} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="url(#gridGlow)" strokeDasharray="3 12" opacity={0.6} />
            <XAxis
              dataKey="date"
              tickFormatter={formatXTick}
              tick={{ fill: isLight ? '#6B7280' : '#9CA3AF', fontSize: 12 }}
              interval={range === 'month' || range === 'all' ? 'preserveStartEnd' : 0}
              axisLine={{ stroke: isLight ? '#E5E7EB' : '#1f2937' }}
              tickLine={{ stroke: isLight ? '#E5E7EB' : '#1f2937' }}
            />
            <YAxis
              domain={[0, Math.ceil(maxValue / 1000) * 1000]}
              tickFormatter={formatValue}
              tick={{ fill: isLight ? '#6B7280' : '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: isLight ? '#E5E7EB' : '#1f2937' }}
              tickLine={{ stroke: isLight ? '#E5E7EB' : '#1f2937' }}
              label={{
                value: 'Views',
                angle: -90,
                position: 'insideLeft',
                style: { fill: isLight ? '#6B7280' : '#94a3b8', fontSize: 12, textAnchor: 'middle' },
                offset: -10,
              }}
            />
            <Tooltip content={(props: TooltipContentProps<number, string>) => <CustomTooltip {...props} />} />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="6 10"
              dot={false}
              isAnimationActive={false}
            />
            {platforms
              .filter((platform) => visiblePlatforms.has(platform.key))
              .map((platform) => (
                <Line
                  key={platform.key}
                  type="monotone"
                  dataKey={platform.key}
                  stroke={platform.color}
                  strokeWidth={2.8}
                  dot={false}
                  activeDot={{ r: 6, stroke: isLight ? '#fff' : '#0f172a', strokeWidth: 2 }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-2 border-t border-gray-200 pt-6 transition-colors duration-200 dark:border-white/10">
        {platforms.map((platform) => (
          <button
            key={platform.key}
            onClick={() => togglePlatform(platform.key)}
            className={clsx(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300',
              visiblePlatforms.has(platform.key)
                ? isLight
                  ? 'border border-cyan-500 bg-cyan-100 text-cyan-700 shadow-sm'
                  : 'border border-cyan-300/70 bg-cyan-400/20 text-white shadow-[0_0_18px_rgba(56,189,248,0.35)]'
                : isLight
                  ? 'border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'border border-transparent bg-white/[0.06] text-gray-400 hover:bg-white/[0.1] hover:text-white'
            )}
          >
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: platform.color }} />
            {platform.label}
          </button>
        ))}
      </div>
    </div>
  );
}
