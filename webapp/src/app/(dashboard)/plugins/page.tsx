// app/(dashboard)/plugins/page.tsx
"use client";

import { Plug, ExternalLink, Download, Settings as SettingsIcon } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'installed' | 'available' | 'coming-soon';
  icon: string;
  color: string;
}

const plugins: Plugin[] = [
  {
    id: 'opus-clip',
    name: 'Opus Clip AI',
    description: 'AI-powered clip generation with viral potential scoring',
    category: 'AI Generation',
    status: 'coming-soon',
    icon: '🎬',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'auto-captions',
    name: 'Auto Captions',
    description: 'Generate animated captions with multiple language support',
    category: 'Editing',
    status: 'coming-soon',
    icon: '💬',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'thumbnail-gen',
    name: 'Thumbnail Generator',
    description: 'Create eye-catching thumbnails with AI assistance',
    category: 'Design',
    status: 'coming-soon',
    icon: '🖼️',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'analytics-pro',
    name: 'Analytics Pro',
    description: 'Advanced performance tracking and insights',
    category: 'Analytics',
    status: 'coming-soon',
    icon: '📊',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'scheduler',
    name: 'Smart Scheduler',
    description: 'Optimal posting times based on audience activity',
    category: 'Automation',
    status: 'coming-soon',
    icon: '⏰',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'hashtag-ai',
    name: 'Hashtag AI',
    description: 'Generate trending hashtags for maximum reach',
    category: 'SEO',
    status: 'coming-soon',
    icon: '#️⃣',
    color: 'from-indigo-500 to-purple-500',
  },
];

export default function PluginsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'installed':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/40 rounded">
            Installed
          </span>
        );
      case 'available':
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded">
            Available
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold bg-zinc-700 text-zinc-400 border border-zinc-600 rounded">
            Coming Soon
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Plugins</h1>
          <p className="text-gray-400">
            Extend Scalepost with powerful integrations and tools
          </p>
        </div>

        {/* Featured Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-800/50 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              ⚡
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Plugin Marketplace Coming Soon</h3>
              <p className="text-sm text-gray-300 mb-3">
                We&apos;re building a powerful plugin ecosystem to supercharge your content creation workflow.
                First batch of plugins launching in the next update.
              </p>
              <button
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition"
                disabled={true}
              >
                Get Notified
              </button>
            </div>
          </div>
        </div>

        {/* Plugins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${plugin.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {plugin.icon}
                </div>
                {getStatusBadge(plugin.status)}
              </div>

              <h3 className="text-lg font-bold mb-2">{plugin.name}</h3>
              <p className="text-sm text-gray-400 mb-4 flex-1">{plugin.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                  {plugin.category}
                </span>
                {plugin.status === 'installed' ? (
                  <button className="p-2 hover:bg-zinc-800 rounded transition">
                    <SettingsIcon className="w-4 h-4 text-gray-400" />
                  </button>
                ) : plugin.status === 'available' ? (
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded text-xs font-semibold hover:bg-gray-100 transition">
                    <Download className="w-3 h-3" />
                    Install
                  </button>
                ) : (
                  <button
                    className="px-3 py-1.5 bg-zinc-800 text-gray-400 rounded text-xs font-semibold cursor-not-allowed"
                    disabled
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Developer Section */}
        <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Plug className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Build Your Own Plugin</h3>
              <p className="text-sm text-gray-400 mb-4">
                Developer API and SDK coming soon. Create custom integrations and share them with the community.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition"
              >
                View Documentation
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
