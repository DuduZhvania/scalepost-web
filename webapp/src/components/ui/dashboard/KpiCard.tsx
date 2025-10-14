// components/ui/dashboard/KpiCard.tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  delta?: number;
  tooltip?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export function KpiCard({ title, value, delta, tooltip, format = 'number' }: KpiCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    if (format === 'currency') {
      return `$${val.toLocaleString()}`;
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    // Format large numbers
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition"
      title={tooltip}
    >
      <div className="text-sm text-gray-400 mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold">{formatValue(value)}</div>
        {delta !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              delta >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {delta >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(delta)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
