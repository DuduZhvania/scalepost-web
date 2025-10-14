// hooks/usePerformanceSeries.ts
import { useEffect, useState } from 'react';

export type Range = 'day' | 'month' | 'year' | 'all';

export interface SeriesPoint {
  ts: string;
  tiktok?: number;
  youtube?: number;
  instagram?: number;
  x?: number;
}

export function usePerformanceSeries(range: Range): { data: SeriesPoint[]; loading: boolean } {
  const [data, setData] = useState<SeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const points = generateSeries(range);
    const timeout = setTimeout(() => {
      setData(points);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [range]);

  return { data, loading };
}

function generateSeries(range: Range): SeriesPoint[] {
  const now = new Date();

  const config = {
    day: { count: 7, stepMs: 24 * 60 * 60 * 1000 },
    month: { count: 30, stepMs: 24 * 60 * 60 * 1000 },
    year: { count: 12, stepMs: 30 * 24 * 60 * 60 * 1000 },
    all: { count: 36, stepMs: 30 * 24 * 60 * 60 * 1000 },
  } as const;

  const { count, stepMs } = config[range];

  const baseValues = {
    tiktok: { base: 3800, amplitude: 1600, trend: 600, phase: 0.4 },
    youtube: { base: 2600, amplitude: 900, trend: 450, phase: 0.1 },
    instagram: { base: 3100, amplitude: 1200, trend: 500, phase: 0.7 },
    x: { base: 1800, amplitude: 650, trend: 280, phase: 0.9 },
  };

  const values: SeriesPoint[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * stepMs);
    const progress = count > 1 ? (count - 1 - i) / (count - 1) : 0;
    const seasonal = Math.sin(progress * Math.PI * 2);

    const point: SeriesPoint = { ts: ts.toISOString() };

    (Object.keys(baseValues) as Array<keyof typeof baseValues>).forEach((platform) => {
      const { base, amplitude, trend, phase } = baseValues[platform];
      const wave = Math.sin(progress * Math.PI * 2 + phase);
      const secondary = Math.cos(progress * Math.PI + phase / 2);
      const trendFactor = trend * progress;

      const raw =
        base +
        amplitude * wave +
        (amplitude / 3) * secondary +
        trendFactor +
        seasonal * amplitude * 0.15;

      point[platform] = Math.max(0, Math.round(raw));
    });

    values.push(point);
  }

  return values;
}
