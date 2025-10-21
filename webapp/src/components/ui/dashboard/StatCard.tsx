// components/ui/dashboard/StatCard.tsx
import React from 'react';

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
  const deltaColor =
    deltaTrend === 'up'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20'
      : deltaTrend === 'down'
        ? 'text-rose-400 bg-rose-500/10 border-rose-400/20'
        : 'text-white/70 bg-white/5 border-white/10';

  return (
    <div
      className="group relative flex min-h-[140px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      title={tooltip}
    >
      <div className="pointer-events-none absolute inset-0 opacity-90 transition-all duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_65%)]" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-white/60">{label}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
          {timeframe}
        </span>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="text-4xl font-bold text-white leading-tight">{value}</div>
        {Sparkline ? <div className="w-16 h-8 opacity-60">{Sparkline}</div> : null}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {delta ? (
          <span
            className={`inline-flex items-center gap-1 text-sm font-medium rounded-full px-2 py-0.5 border ${deltaColor}`}
          >
            {deltaTrend === 'up' ? '▲' : deltaTrend === 'down' ? '▼' : '•'} {delta}
          </span>
        ) : (
          <span />
        )}
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
          {icon}
        </div>
      </div>
    </div>
  );
}
