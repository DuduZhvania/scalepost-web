// app/(dashboard)/accounts/page.tsx
'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { PlatformAccordion } from '@/components/accounts/PlatformAccordion';
import { useAccounts } from '@/hooks/useAccounts';
import { useTheme } from '@/components/ui/providers/ThemeProvider';

export default function AccountsPage() {
  const { theme } = useTheme();
  const [filterPlatform, setFilterPlatform] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: allAccounts, loading } = useAccounts();

  const platforms: Array<'tiktok' | 'youtube' | 'instagram' | 'x'> = [
    'tiktok',
    'youtube',
    'instagram',
    'x',
  ];

  const filteredAccounts = allAccounts.filter((account) => {
    if (filterPlatform && account.platform !== filterPlatform) return false;
    if (searchQuery && !account.handle.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  const getAccountsByPlatform = (platform: 'tiktok' | 'youtube' | 'instagram' | 'x') => {
    return filteredAccounts.filter((a) => a.platform === platform);
  };

  return (
    <div
      className="min-h-screen text-gray-900 dark:text-white p-8 transition-colors duration-200 dark:bg-black"
      style={{
        background: theme !== 'dark' ? 'linear-gradient(145deg, #f4f2ff 0%, #eef2ff 50%, #f7f9ff 100%)' : undefined
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Connected Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all your social media accounts across platforms
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Platform Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterPlatform(undefined)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                !filterPlatform
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-200 dark:border-zinc-700'
                  : 'bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPlatform('tiktok')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                filterPlatform === 'tiktok'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-200 dark:border-zinc-700'
                  : 'bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              TikTok
            </button>
            <button
              onClick={() => setFilterPlatform('youtube')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                filterPlatform === 'youtube'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-200 dark:border-zinc-700'
                  : 'bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              YouTube
            </button>
            <button
              onClick={() => setFilterPlatform('instagram')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                filterPlatform === 'instagram'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-200 dark:border-zinc-700'
                  : 'bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setFilterPlatform('x')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                filterPlatform === 'x'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-200 dark:border-zinc-700'
                  : 'bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              X
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Connect Account Button */}
          <button className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Connect Account
          </button>
        </div>

        {/* Platform Accordions */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border border-zinc-800 rounded-lg p-6 h-20 animate-pulse bg-zinc-900"
              />
            ))}
          </div>
        ) : (
          <div>
            {platforms.map((platform) => {
              const accounts = getAccountsByPlatform(platform);
              if (filterPlatform && filterPlatform !== platform) return null;
              return (
                <PlatformAccordion
                  key={platform}
                  platform={platform}
                  accounts={accounts}
                  href={`/accounts/${platform}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
