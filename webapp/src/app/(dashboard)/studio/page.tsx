// app/(dashboard)/studio/page.tsx
'use client';

import React, { useState } from 'react';
import { StudioTabs, type StudioTab } from '@/components/studio/StudioTabs';
import { StudioLongToShort } from '@/components/studio/StudioLongToShort';
import {
  StudioCaptions,
  StudioResize,
  StudioRehash,
  StudioTemplates,
  StudioHistory,
} from '@/components/studio/StudioTabContent';
import { useUploadModal } from '@/hooks/useUploadModal';
import { useTheme } from '@/components/ui/providers/ThemeProvider';

export default function StudioPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<StudioTab>('long-to-short');
  const { open } = useUploadModal();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'long-to-short':
        return <StudioLongToShort />;
      case 'captions':
        return <StudioCaptions />;
      case 'resize':
        return <StudioResize />;
      case 'rehash':
        return <StudioRehash />;
      case 'templates':
        return <StudioTemplates />;
      case 'history':
        return <StudioHistory />;
      default:
        return <StudioLongToShort />;
    }
  };

  return (
    <div
      className="min-h-screen text-gray-900 dark:text-white transition-colors duration-200 dark:bg-black"
      style={{
        background: theme !== 'dark' ? 'linear-gradient(145deg, #f4f2ff 0%, #eef2ff 50%, #f7f9ff 100%)' : undefined
      }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Studio</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Transform your content with AI-powered editing tools
          </p>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-lg bg-white/90 dark:bg-zinc-900 px-5 text-sm font-semibold text-black dark:text-white transition hover:bg-white dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700"
          onClick={() => open({ tab: 'file' })}
        >
          Upload Video
        </button>
      </div>

      {/* Tabs */}
      <StudioTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
