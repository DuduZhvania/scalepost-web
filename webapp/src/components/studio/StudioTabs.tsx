// components/studio/StudioTabs.tsx
'use client';

import React from 'react';

export type StudioTab = 'long-to-short' | 'captions' | 'resize' | 'rehash' | 'templates' | 'history';

interface StudioTabsProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
}

const tabs: { value: StudioTab; label: string }[] = [
  { value: 'long-to-short', label: 'Long → Short' },
  { value: 'captions', label: 'Captions' },
  { value: 'resize', label: 'Resize' },
  { value: 'rehash', label: 'Rehash' },
  { value: 'templates', label: 'Templates' },
  { value: 'history', label: 'History' },
];

export function StudioTabs({ activeTab, onTabChange }: StudioTabsProps) {
  return (
    <div className="border-b border-zinc-800">
      <div className="flex gap-1 px-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.value
                ? 'border-white text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
