// components/accounts/AccountsTable.tsx
'use client';

import React from 'react';
import { MoreVertical, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { type Account } from '@/hooks/useAccounts';

interface AccountsTableProps {
  accounts: Account[];
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'needs_reauth':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'rate_limited':
        return <Clock className="w-4 h-4 text-orange-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'needs_reauth':
        return 'Needs Reauth';
      case 'rate_limited':
        return 'Rate Limited';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  const formatLastSync = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (accounts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No accounts connected for this platform
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Handle
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Last Sync
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {accounts.map((account) => (
            <tr key={account.id} className="hover:bg-zinc-900/50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                    {account.handle[1]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div className="font-medium">{account.handle}</div>
                    {account.tags && account.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {account.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-zinc-800 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(account.status)}
                  <span className="text-sm">{getStatusLabel(account.status)}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-400">{account.group || '—'}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-400">
                  {formatLastSync(account.lastSync)}
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="p-2 hover:bg-zinc-800 rounded transition">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
