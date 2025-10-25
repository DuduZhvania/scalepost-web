'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
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
          'min-w-[200px] rounded-xl border p-4 shadow-2xl transition-colors duration-200',
          isLight ? 'border-gray-200 bg-white text-gray-800' : 'border-white/10 text-gray-200'
        )}
        style={{
          background: !isLight ? '#171717' : undefined
        }}
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

  const gradientTop = isLight ? 'rgba(99,102,241,0.14)' : 'rgba(229,229,229,0.1)';
  const gradientBottom = isLight ? 'rgba(226,232,240,0)' : 'rgba(229,229,229,0)';

  return (
    <div className="animate-fade-in group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm transition-all duration-300" style={{
      background: theme === 'dark' ? '#171717' : undefined,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : undefined,
      boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : undefined,
      color: theme === 'dark' ? '#fafafa' : undefined
    }}>
      <div className="relative mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold" style={{
            color: theme === 'dark' ? '#fafafa' : undefined
          }}>Performance Overview</h3>
          <p className="text-sm text-gray-500" style={{
            color: theme === 'dark' ? '#a1a1a1' : undefined
          }}>
            Real-time resonance across TikTok, YouTube, Instagram, and X
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 p-1.5 transition-colors duration-200" style={{
          background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : undefined,
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : undefined
        }}>
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onRangeChange(option.value)}
              className={clsx(
                'rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-300',
                range === option.value
                  ? isLight
                    ? 'bg-gray-900 text-white shadow'
                    : 'shadow'
                  : isLight
                    ? 'text-gray-500 hover:bg-white hover:text-gray-900'
                    : ''
              )}
              style={{
                background: !isLight && range === option.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: !isLight && range === option.value ? '#fafafa' : (!isLight ? '#a1a1a1' : undefined)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 4, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="gridGlow" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={gradientTop} />
                <stop offset="100%" stopColor={gradientBottom} />
              </linearGradient>
              {platforms
                .filter((platform) => visiblePlatforms.has(platform.key))
                .map((platform, index) => (
                  <linearGradient key={platform.key} id={`area-${platform.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isLight ? platform.color : 'rgba(229,229,229,0.5)'} stopOpacity={isLight ? 0.4 : 0.35} />
                    <stop offset="95%" stopColor={isLight ? platform.color : 'rgba(229,229,229,0.1)'} stopOpacity={0} />
                  </linearGradient>
                ))}
            </defs>
            <CartesianGrid stroke="url(#gridGlow)" strokeDasharray="3 12" opacity={isLight ? 0.6 : 0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={formatXTick}
              tick={{ fill: isLight ? '#6B7280' : '#a1a1a1', fontSize: 12 }}
              interval={range === 'month' || range === 'all' ? 'preserveStartEnd' : 0}
              axisLine={{ stroke: isLight ? '#E5E7EB' : 'rgba(229,229,229,0.1)' }}
              tickLine={{ stroke: isLight ? '#E5E7EB' : 'rgba(229,229,229,0.1)' }}
            />
            <YAxis
              domain={[0, Math.ceil(maxValue / 1000) * 1000]}
              tickFormatter={formatValue}
              tick={{ fill: isLight ? '#6B7280' : '#a1a1a1', fontSize: 12 }}
              axisLine={{ stroke: isLight ? '#E5E7EB' : 'rgba(229,229,229,0.1)' }}
              tickLine={{ stroke: isLight ? '#E5E7EB' : 'rgba(229,229,229,0.1)' }}
              label={{
                value: 'Views',
                angle: -90,
                position: 'insideLeft',
                style: { fill: isLight ? '#6B7280' : '#a1a1a1', fontSize: 12, textAnchor: 'middle' },
                offset: -10,
              }}
            />
            <Tooltip content={(props: TooltipContentProps<number, string>) => <CustomTooltip {...props} />} />
            {platforms
              .filter((platform) => visiblePlatforms.has(platform.key))
              .map((platform) => (
                <Area
                  key={platform.key}
                  type="monotone"
                  dataKey={platform.key}
                  stroke={isLight ? platform.color : "#e5e5e5"}
                  strokeWidth={2.8}
                  fill={`url(#area-${platform.key})`}
                  dot={false}
                  activeDot={{ r: 6, stroke: isLight ? '#fff' : '#171717', strokeWidth: 2 }}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-2 border-t border-gray-200 pt-6 transition-colors duration-200" style={{
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : undefined
      }}>
        {platforms.map((platform) => (
          <button
            key={platform.key}
            onClick={() => togglePlatform(platform.key)}
            className={clsx(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300',
              visiblePlatforms.has(platform.key)
                ? isLight
                  ? 'border border-cyan-500 bg-cyan-100 text-cyan-700 shadow-sm'
                  : 'shadow-sm'
                : isLight
                  ? 'border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : ''
            )}
            style={{
              background: !isLight && visiblePlatforms.has(platform.key) ? '#e5e5e5' : 'transparent',
              borderColor: !isLight && visiblePlatforms.has(platform.key) ? '#e5e5e5' : 'transparent',
              color: !isLight && visiblePlatforms.has(platform.key) ? '#171717' : (!isLight ? '#fafafa' : undefined)
            }}
          >
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: isLight ? platform.color : '#e5e5e5' }} />
            {platform.label}
          </button>
        ))}
      </div>
    </div>
  );
}
