// components/ui/dashboard/HeaderBar.tsx
'use client';

import React from 'react';
import { Search, Bell, Upload } from 'lucide-react';
import { useUploadModal } from '@/hooks/useUploadModal';

export function HeaderBar() {
  const { open } = useUploadModal();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
      {/* Left: Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-zinc-700 transition"
          />
        </div>
      </div>

      {/* Right: Upload + Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Upload Button */}
        <button
          onClick={() => open({ tab: 'file' })}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-gray-100 hover:shadow-md"
        >
          <Upload className="h-4 w-4 text-black" />
          Upload
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-zinc-900 rounded-lg transition">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div className="text-sm">
            <div className="font-medium">Anonymous</div>
            <div className="text-xs text-gray-500">Free Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
