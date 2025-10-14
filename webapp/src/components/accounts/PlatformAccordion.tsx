// components/accounts/PlatformAccordion.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { PlatformBadge } from '../ui/PlatformBadge';
import { AccountsTable } from './AccountsTable';
import { type Account } from '@/hooks/useAccounts';
import Link from 'next/link';

interface PlatformAccordionProps {
  platform: 'tiktok' | 'youtube' | 'instagram' | 'x';
  accounts: Account[];
  href: string;
}

export function PlatformAccordion({ platform, accounts, href }: PlatformAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const platformNames = {
    tiktok: 'TikTok',
    youtube: 'YouTube Shorts',
    instagram: 'Instagram Reels',
    x: 'Twitter/X',
  };

  const activeCount = accounts.filter((a) => a.status === 'active').length;
  const pendingCount = accounts.filter((a) => a.status === 'needs_reauth').length;
  const errorCount = accounts.filter(
    (a) => a.status === 'error' || a.status === 'rate_limited'
  ).length;

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden mb-4 bg-zinc-900">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <Link
          href={href}
          className="flex items-center justify-between gap-4 rounded-lg border border-transparent bg-zinc-900/20 px-4 py-3 transition hover:border-zinc-700 hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:flex-1"
        >
          <div className="flex items-center gap-4">
            <PlatformBadge platform={platform} size="lg" />
            <div>
              <h3 className="font-bold text-lg">{platformNames[platform]}</h3>
              <p className="text-sm text-gray-400">
                {accounts.length} accounts
                {activeCount > 0 && ` · ${activeCount} active`}
                {pendingCount > 0 && ` · ${pendingCount} pending`}
                {errorCount > 0 && ` · ${errorCount} error`}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            View
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              // TODO: handle add account flow
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
          <ChevronDown
            className={`w-5 h-5 cursor-pointer text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            onClick={() => setIsExpanded((prev) => !prev)}
            role="button"
            aria-label={isExpanded ? 'Collapse preview' : 'Expand preview'}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setIsExpanded((prev) => !prev);
              }
            }}
          />
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="bg-black border-t border-zinc-800">
          <AccountsTable accounts={accounts} />
        </div>
      )}
    </div>
  );
}
