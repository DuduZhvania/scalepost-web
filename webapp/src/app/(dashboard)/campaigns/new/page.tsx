// app/campaigns/new/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Account {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
}

interface Clip {
  id: string;
  title: string;
  thumbnail?: string;
  duration: number;
  score?: number;
}

export default function CampaignBuilder() {
  // Mock data for now - will be replaced with real data fetching
  const clips: Clip[] = [];
  const accounts: Account[] = [];
  const [campaignName, setCampaignName] = useState('');
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'hourly'>('once');
  const [rehash, setRehash] = useState(false);

  const toggleClip = (clipId: string) => {
    const newSet = new Set(selectedClips);
    if (newSet.has(clipId)) {
      newSet.delete(clipId);
    } else {
      newSet.add(clipId);
    }
    setSelectedClips(newSet);
  };

  const toggleAccount = (accountId: string) => {
    const newSet = new Set(selectedAccounts);
    if (newSet.has(accountId)) {
      newSet.delete(accountId);
    } else {
      newSet.add(accountId);
    }
    setSelectedAccounts(newSet);
  };

  const selectAllClips = () => {
    if (selectedClips.size === clips.length) {
      setSelectedClips(new Set());
    } else {
      setSelectedClips(new Set(clips.map(c => c.id)));
    }
  };

  const totalPosts = selectedClips.size * selectedAccounts.size;

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    if (selectedClips.size === 0) {
      alert('Please select at least one clip');
      return;
    }

    if (selectedAccounts.size === 0) {
      alert('Please select at least one account');
      return;
    }

    const campaignData = {
      name: campaignName,
      clipIds: Array.from(selectedClips),
      accountIds: Array.from(selectedAccounts),
      scheduleType,
      scheduledAt: scheduleType === 'scheduled' ? `${startDate}T${startTime}` : null,
      frequency,
      settings: {
        rehash,
      },
    };

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      if (res.ok) {
        const { campaign } = await res.json();
        window.location.href = `/campaigns/${campaign.id}`;
      } else {
        alert('Failed to create campaign');
      }
    } catch (err) {
      alert('Error creating campaign');
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      tiktok: 'bg-pink-500',
      youtube: 'bg-red-500',
      instagram: 'bg-purple-500',
      twitter: 'bg-blue-500',
    };
    return colors[platform] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <a href="/campaigns" className="text-gray-400 hover:text-white mb-4 inline-block">
            ← Back to Campaigns
          </a>
          <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-gray-400">Schedule and distribute your clips across multiple accounts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Config */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Name */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <label className="block text-sm font-semibold mb-2">Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Weekly Content Drop"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition"
              />
            </div>

            {/* Select Clips */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Select Clips ({selectedClips.size}/{clips.length})</h2>
                <button
                  onClick={selectAllClips}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  {selectedClips.size === clips.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {clips.map((clip) => (
                  <div
                    key={clip.id}
                    onClick={() => toggleClip(clip.id)}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition
                      ${
                        selectedClips.has(clip.id)
                          ? 'bg-white bg-opacity-10 border-white'
                          : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                      }
                    `}
                  >
                    <div className="w-16 h-16 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                      {clip.thumbnail ? (
                        <img src={clip.thumbnail} alt={clip.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          No preview
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{clip.title}</div>
                      <div className="text-sm text-gray-400">
                        {Math.floor(clip.duration / 60)}:{(clip.duration % 60).toString().padStart(2, '0')}
                        {clip.score && (
                          <span className="ml-2">
                            · Score: {clip.score}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedClips.has(clip.id) && (
                      <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Select Accounts */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Select Accounts ({selectedAccounts.size})</h2>

              {accounts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="mb-4">No accounts connected</p>
                  <Link
                    href="/accounts"
                    className="inline-block px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    Connect Accounts
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts
                    .filter(acc => acc.isActive)
                    .map((account) => (
                      <div
                        key={account.id}
                        onClick={() => toggleAccount(account.id)}
                        className={`
                          flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition
                          ${
                            selectedAccounts.has(account.id)
                              ? 'bg-white bg-opacity-10 border-white'
                              : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                          }
                        `}
                      >
                        <div className={`w-10 h-10 ${getPlatformColor(account.platform)} rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {account.platform.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{account.accountName}</div>
                          <div className="text-sm text-gray-400 capitalize">{account.platform}</div>
                        </div>
                        {selectedAccounts.has(account.id) && (
                          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Schedule Settings */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Schedule</h2>

              <div className="space-y-4">
                {/* Schedule Type */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setScheduleType('immediate')}
                    className={`
                      flex-1 px-4 py-3 rounded-lg border transition font-semibold
                      ${
                        scheduleType === 'immediate'
                          ? 'bg-white text-black border-white'
                          : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                      }
                    `}
                  >
                    Post Now
                  </button>
                  <button
                    onClick={() => setScheduleType('scheduled')}
                    className={`
                      flex-1 px-4 py-3 rounded-lg border transition font-semibold
                      ${
                        scheduleType === 'scheduled'
                          ? 'bg-white text-black border-white'
                          : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                      }
                    `}
                  >
                    Schedule
                  </button>
                </div>

                {/* Date/Time Inputs */}
                {scheduleType === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-2 text-gray-400">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2 text-gray-400">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-white transition"
                      />
                    </div>
                  </div>
                )}

                {/* Frequency */}
                <div>
                  <label className="block text-sm mb-2 text-gray-400">Posting Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as 'once' | 'daily' | 'hourly')}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-white transition"
                  >
                    <option value="once">Post All Once</option>
                    <option value="hourly">Hourly Distribution</option>
                    <option value="daily">Daily Distribution</option>
                  </select>
                </div>

                {/* Rehash Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rehash}
                    onChange={(e) => setRehash(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-semibold">Enable Auto-Rehash</div>
                    <div className="text-sm text-gray-400">
                      Automatically modify clips to bypass duplicate content filters
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Campaign Summary</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Total Posts</div>
                  <div className="text-3xl font-bold">{totalPosts}</div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Breakdown</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Clips selected:</span>
                      <span className="font-semibold">{selectedClips.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accounts selected:</span>
                      <span className="font-semibold">{selectedAccounts.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Posts per account:</span>
                      <span className="font-semibold">{selectedClips.size}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Schedule</div>
                  <div className="text-sm">
                    {scheduleType === 'immediate' ? (
                      <span className="font-semibold">Posting immediately</span>
                    ) : (
                      <span className="font-semibold">
                        {startDate && startTime
                          ? `Starts ${new Date(`${startDate}T${startTime}`).toLocaleString()}`
                          : 'Not scheduled yet'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateCampaign}
                disabled={totalPosts === 0}
                className="w-full px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}