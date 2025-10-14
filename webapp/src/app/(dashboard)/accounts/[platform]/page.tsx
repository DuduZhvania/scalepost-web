// app/(dashboard)/accounts/[platform]/page.tsx
'use client';

import { useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, PlusCircle } from 'lucide-react';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import { AccountsTable } from '@/components/accounts/AccountsTable';
import { type Account, type AccountStatus, useAccounts } from '@/hooks/useAccounts';

const platformNames: Record<'tiktok' | 'youtube' | 'instagram' | 'x', string> = {
  tiktok: 'TikTok',
  youtube: 'YouTube',
  instagram: 'Instagram',
  x: 'X',
};

type PerformanceRow = {
  id: string;
  handle: string;
  videoCount: number;
  totalViews: number;
  avgViews: number;
  weeklyPosts: number;
};

interface PlatformPageProps {
  params: Promise<{ platform: string }>;
}

export default function PlatformPage({ params }: PlatformPageProps) {
  const resolvedParams = use(params);
  const platformKey = resolvedParams.platform.toLowerCase();
  const knownPlatforms = ['tiktok', 'youtube', 'instagram', 'x'] as const;
  const isKnownPlatform = (knownPlatforms as readonly string[]).includes(platformKey);
  const platform = (isKnownPlatform ? platformKey : 'tiktok') as Account['platform'];

  const { data, loading } = useAccounts(platform);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (!loading) {
      setAccounts(data);
    }
  }, [data, loading]);

  const [handleInput, setHandleInput] = useState('');
  const [groupInput, setGroupInput] = useState('');
  const [statusInput, setStatusInput] = useState<AccountStatus>('active');

  const performanceRows: PerformanceRow[] = useMemo(
    () =>
      accounts.map((account) => {
        const seed = Array.from(account.handle).reduce(
          (acc, char, index) => acc + char.charCodeAt(0) * (index + 1),
          0
        );
        const videoCount = 32 + (seed % 48);
        const totalViews = 18000 + (seed % 82000);
        const weeklyPosts = 3 + (seed % 4);
        const avgViews = Math.round(totalViews / Math.max(videoCount, 1));

        return {
          id: account.id,
          handle: account.handle,
          videoCount,
          totalViews,
          avgViews,
          weeklyPosts,
        };
      }),
    [accounts]
  );

  const aggregated = useMemo(() => {
    if (!performanceRows.length) {
      return {
        totalAccounts: 0,
        totalVideos: 0,
        totalViews: 0,
        avgViewsPerVideo: 0,
        avgWeeklyPosts: 0,
      };
    }

    const totals = performanceRows.reduce(
      (acc, row) => ({
        totalVideos: acc.totalVideos + row.videoCount,
        totalViews: acc.totalViews + row.totalViews,
        weeklyPosts: acc.weeklyPosts + row.weeklyPosts,
      }),
      { totalVideos: 0, totalViews: 0, weeklyPosts: 0 }
    );

    return {
      totalAccounts: performanceRows.length,
      totalVideos: totals.totalVideos,
      totalViews: totals.totalViews,
      avgViewsPerVideo:
        totals.totalVideos > 0 ? Math.round(totals.totalViews / totals.totalVideos) : 0,
      avgWeeklyPosts: Math.round(totals.weeklyPosts / performanceRows.length),
    };
  }, [performanceRows]);

  const handleAddAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!handleInput.trim()) return;

    const nextHandle = handleInput.startsWith('@')
      ? handleInput.trim()
      : `@${handleInput.trim()}`;

    const newAccount: Account = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      platform,
      handle: nextHandle,
      status: statusInput,
      group: groupInput || undefined,
      lastSync: new Date().toISOString(),
    };

    setAccounts((prev) => [newAccount, ...prev]);
    setHandleInput('');
    setGroupInput('');
    setStatusInput('active');
  };

  if (!isKnownPlatform) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="text-3xl font-semibold text-white">Platform not found</div>
          <p className="text-sm text-gray-400">
            We couldn&apos;t find analytics for <code>{resolvedParams.platform}</code>. Choose one
            of the available platforms from the accounts overview.
          </p>
          <Link
            href="/accounts"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to accounts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <Link
            href="/accounts"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-zinc-600 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to overview
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <PlatformBadge platform={platform} size="lg" />
            <div>
              <h1 className="text-3xl font-semibold text-white">
                {platformNames[platform]} Accounts
              </h1>
              <p className="text-sm text-gray-400">
                Manage accounts, performance, and integrations for {platformNames[platform]}.
              </p>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Connected accounts" value={aggregated.totalAccounts} />
          <MetricCard label="Videos posted" value={aggregated.totalVideos} />
          <MetricCard
            label="Total views"
            value={aggregated.totalViews}
            format="compact"
          />
          <MetricCard
            label="Avg views / video"
            value={aggregated.avgViewsPerVideo}
            format="compact"
          />
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Add new account</h2>
              <p className="text-sm text-gray-400">
                Connect another {platformNames[platform]} handle for scheduling and analytics.
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </header>
          <form className="grid gap-4 md:grid-cols-4" onSubmit={handleAddAccount}>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-300">Handle</label>
              <input
                type="text"
                required
                placeholder="@yourchannel"
                value={handleInput}
                onChange={(event) => setHandleInput(event.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Group</label>
              <input
                type="text"
                placeholder="Team, region, etc."
                value={groupInput}
                onChange={(event) => setGroupInput(event.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Status</label>
              <select
                value={statusInput}
                onChange={(event) => setStatusInput(event.target.value as AccountStatus)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-zinc-600 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="needs_reauth">Needs Reauth</option>
                <option value="rate_limited">Rate Limited</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
              >
                <PlusCircle className="h-4 w-4" />
                Add account
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
          <header className="mb-6">
            <h2 className="text-lg font-semibold text-white">Platform performance</h2>
            <p className="text-sm text-gray-400">
              High-level posting and reach metrics aggregated across your connected accounts.
            </p>
          </header>

          {performanceRows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-gray-400">
              Connect accounts to see performance analytics.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Videos posted</th>
                    <th className="px-4 py-3">Total views</th>
                    <th className="px-4 py-3">Avg views / video</th>
                    <th className="px-4 py-3">Avg posts / week</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-sm">
                  {performanceRows.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3 font-medium text-white">{row.handle}</td>
                      <td className="px-4 py-3 text-gray-300">{row.videoCount}</td>
                      <td className="px-4 py-3 text-gray-300">
                        {formatNumber(row.totalViews, 'compact')}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {formatNumber(row.avgViews, 'compact')}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{row.weeklyPosts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
          <header className="mb-6">
            <h2 className="text-lg font-semibold text-white">All accounts</h2>
            <p className="text-sm text-gray-400">
              Manage authentication status and details for every connected handle.
            </p>
          </header>
          {loading && accounts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-gray-400">
              Loading accounts…
            </div>
          ) : (
            <AccountsTable accounts={accounts} />
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format?: 'default' | 'compact';
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(value, format)}</p>
    </div>
  );
}

function formatNumber(value: number, format: 'default' | 'compact' = 'default') {
  const formatter = new Intl.NumberFormat(undefined, {
    notation: format === 'compact' ? 'compact' : 'standard',
    maximumFractionDigits: format === 'compact' ? 1 : 0,
  });
  return formatter.format(value);
}
