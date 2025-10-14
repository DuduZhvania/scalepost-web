// app/(dashboard)/campaigns/page.tsx
"use client";

import { Rocket, Plus, Clock, CheckCircle, Pause, Play } from 'lucide-react';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'paused' | 'completed';
  totalClips: number;
  postsScheduled: number;
  postsPublished: number;
  platforms: string[];
  startDate: string;
  createdAt: string;
}

export default function CampaignsPage() {
  // Mock data for now - will be replaced with real data fetching
  const campaigns: Campaign[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/40 rounded-full">
            <Play className="w-3 h-3" />
            Active
          </span>
        );
      case 'scheduled':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded-full">
            <Pause className="w-3 h-3" />
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
            <p className="text-gray-400">
              Create and manage content distribution campaigns
            </p>
          </div>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </Link>
        </div>

        {campaigns.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
              <Rocket className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">No campaigns yet</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Launch your first campaign to automatically distribute your content across multiple platforms.
              Create schedules, manage accounts, and track performance all in one place.
            </p>
            <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <Plus className="w-5 h-5" />
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          // Campaigns Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold truncate flex-1">{campaign.name}</h3>
                  {getStatusBadge(campaign.status)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Clips</span>
                    <span className="font-semibold">{campaign.totalClips}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Published</span>
                    <span className="font-semibold">{campaign.postsPublished} / {campaign.postsScheduled}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Platforms</span>
                    <span className="font-semibold">{campaign.platforms.length}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 text-xs text-gray-500">
                  Started {new Date(campaign.startDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
