// components/ui/dashboard/StatCard.tsx
'use client';

import React from 'react';
import { useTheme } from '@/components/ui/providers/ThemeProvider';

export type StatCardProps = {
  label: string;
  timeframe?: string;
  value: string | number;
  delta?: string;
  deltaTrend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  Sparkline?: React.ReactNode;
  tooltip?: string;
};

export function StatCard({
  label,
  timeframe = 'Last 30 Days',
  value,
  delta,
  deltaTrend = 'up',
  icon,
  Sparkline,
  tooltip,
}: StatCardProps) {
  const { theme } = useTheme();
  const deltaColor =
    deltaTrend === 'up'
      ? theme === 'dark'
        ? 'bg-white/5 border-white/10'
        : 'text-emerald-600 bg-emerald-500/10 border-emerald-400/20'
      : deltaTrend === 'down'
        ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-400/20'
        : 'text-gray-600 dark:text-white/70 bg-gray-200 dark:bg-white/5 border-gray-300 dark:border-white/10';
  
  const deltaTextColor = theme === 'dark' && deltaTrend === 'up' ? '#e5e5e5' : undefined;

  return (
    <div
      className="group relative flex min-h-[110px] flex-col overflow-hidden rounded-2xl p-4 transition-all duration-300 border shadow-sm"
      style={{
        background: theme === 'dark'
          ? '#171717'
          : 'linear-gradient(145deg, rgba(255,255,255,0.75) 0%, rgba(245,247,255,0.75) 100%)',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        boxShadow: theme === 'dark'
          ? '0 2px 8px rgba(0,0,0,0.3)'
          : '0 3px 12px rgba(0,0,0,0.04), inset 0 0 12px rgba(255,255,255,0.5)',
        position: 'relative'
      }}
      title={tooltip}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-gray-600" style={{
          color: theme === 'dark' ? '#a1a1a1' : undefined
        }}>{label}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/90 text-gray-900 border border-gray-200 font-medium" style={{
          background: theme === 'dark' ? '#171717' : undefined,
          color: theme === 'dark' ? '#a1a1a1' : undefined,
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : undefined
        }}>
          {timeframe}
        </span>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="text-4xl font-bold leading-tight text-gray-900" style={{
          color: theme === 'dark' ? '#e5e5e5' : undefined
        }}>{value}</div>
        {Sparkline ? <div className="w-16 h-8 opacity-60">{Sparkline}</div> : null}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {delta ? (
          <span
            className={`inline-flex items-center gap-1 text-sm font-medium rounded-full px-2 py-0.5 border ${deltaColor}`}
            style={{
              color: deltaTextColor
            }}
          >
            {deltaTrend === 'up' ? '▲' : deltaTrend === 'down' ? '▼' : '•'} {delta}
          </span>
        ) : (
          <span />
        )}
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/10 border border-purple-500/20 text-gray-600" style={{
          background: theme === 'dark' ? 'rgba(229,229,229,0.1)' : undefined,
          borderColor: theme === 'dark' ? 'rgba(229,229,229,0.2)' : undefined,
          color: theme === 'dark' ? '#a1a1a1' : undefined
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
