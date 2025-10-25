// components/ui/dashboard/HeaderBar.tsx
'use client';

import React from 'react';
import { Search, Bell, Upload } from 'lucide-react';
import { useUploadModal } from '@/hooks/useUploadModal';
import { useTheme } from '@/components/ui/providers/ThemeProvider';

export function HeaderBar() {
  const { open } = useUploadModal();
  const { theme } = useTheme();

  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-b transition-colors duration-200"
      style={{
        background: theme === 'dark'
          ? '#0a0a0a'
          : 'linear-gradient(145deg, rgba(248, 246, 255, 0.8) 0%, rgba(240, 244, 255, 0.8) 50%, rgba(249, 251, 255, 0.8) 100%)',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb'
      }}
    >
      {/* Left: Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" style={{
            color: theme === 'dark' ? '#a1a1a1' : undefined
          }} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-gray-300 transition"
            style={{
              background: theme === 'dark' ? '#171717' : undefined,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : undefined,
              color: theme === 'dark' ? '#fafafa' : undefined
            }}
          />
        </div>
      </div>

      {/* Right: Upload + Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Upload Button */}
        <button
          onClick={() => open({ tab: 'file' })}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          style={{
            background: theme === 'dark' ? '#e5e5e5' : undefined,
            color: theme === 'dark' ? '#171717' : undefined
          }}
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>

        {/* Notifications */}
        <button 
          className={`relative p-2 rounded-lg transition ${
            theme === 'dark' 
              ? 'hover:bg-white/5' 
              : 'hover:bg-gray-100'
          }`}
          style={{
            background: theme === 'dark' ? 'transparent' : undefined,
          }}
        >
          <Bell className="w-5 h-5 text-gray-600" style={{
            color: theme === 'dark' ? '#a1a1a1' : undefined
          }} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200" style={{
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : undefined
        }}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
            A
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900" style={{
              color: theme === 'dark' ? '#fafafa' : undefined
            }}>Anonymous</div>
            <div className="text-xs text-gray-500" style={{
              color: theme === 'dark' ? '#a1a1a1' : undefined
            }}>Free Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
