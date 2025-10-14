// app/(dashboard)/settings/page.tsx
"use client";

import { useState } from 'react';
import { User, Bell, CreditCard, Lock, Palette } from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'billing' | 'security' | 'preferences';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as const, name: 'Profile', icon: User },
    { id: 'notifications' as const, name: 'Notifications', icon: Bell },
    { id: 'billing' as const, name: 'Billing', icon: CreditCard },
    { id: 'security' as const, name: 'Security', icon: Lock },
    { id: 'preferences' as const, name: 'Preferences', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-white text-black font-semibold'
                        : 'text-gray-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'billing' && <BillingSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'preferences' && <PreferenceSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Profile Settings</h2>

      <div className="space-y-6">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium mb-3">Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
              A
            </div>
            <div>
              <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition mr-2">
                Upload New
              </button>
              <button className="px-4 py-2 bg-zinc-800 text-gray-400 rounded-lg text-sm hover:bg-zinc-700 transition">
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            placeholder="Anonymous User"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            placeholder="user@example.com"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
          />
        </div>

        <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const notifications = [
    { id: 'clip-ready', label: 'Clip generation complete', description: 'Get notified when AI finishes generating clips' },
    { id: 'campaign-complete', label: 'Campaign completed', description: 'Receive alerts when campaigns finish posting' },
    { id: 'account-issue', label: 'Account connection issues', description: 'Be notified of any platform connection problems' },
    { id: 'weekly-report', label: 'Weekly performance report', description: 'Summary of your content performance' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>

      <div className="space-y-6">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium mb-1">{notif.label}</div>
              <div className="text-sm text-gray-400">{notif.description}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
            </label>
          </div>
        ))}

        <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Current Plan</h2>

        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
              <p className="text-gray-400">Perfect for getting started</p>
            </div>
            <div className="text-3xl font-bold">$0</div>
          </div>
          <ul className="space-y-2 text-sm text-gray-400 mb-6">
            <li>✓ 5 videos per month</li>
            <li>✓ 10 clips per video</li>
            <li>✓ 1 connected account</li>
            <li>✓ Basic analytics</li>
          </ul>
          <button className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
            Upgrade to Pro
          </button>
        </div>

        <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
          <p className="text-sm text-blue-300">
            Billing and payment processing will be available once we launch monetization. Stay tuned!
          </p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Payment Method</h2>
        <p className="text-gray-400 text-sm">Coming soon - Stripe integration in progress</p>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Security Settings</h2>

      <div className="space-y-6">
        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-2">Change Password</label>
          <input
            type="password"
            placeholder="Current password"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600 mb-3"
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600 mb-3"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* 2FA */}
        <div className="flex items-start justify-between py-4 border-t border-zinc-800">
          <div className="flex-1">
            <div className="font-medium mb-1">Two-Factor Authentication</div>
            <div className="text-sm text-gray-400">Add an extra layer of security to your account</div>
          </div>
          <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition ml-4">
            Enable
          </button>
        </div>

        {/* Sessions */}
        <div className="py-4 border-t border-zinc-800">
          <div className="font-medium mb-3">Active Sessions</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div>
                <div className="text-sm font-medium">Current Session</div>
                <div className="text-xs text-gray-400">MacOS · Chrome · San Francisco, US</div>
              </div>
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
        </div>

        <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
          Update Security Settings
        </button>
      </div>
    </div>
  );
}

function PreferenceSettings() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Preferences</h2>

      <div className="space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600">
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600">
            <option>UTC (GMT+0:00)</option>
            <option>Pacific Time (GMT-8:00)</option>
            <option>Eastern Time (GMT-5:00)</option>
            <option>Central European Time (GMT+1:00)</option>
          </select>
        </div>

        {/* Default Export Quality */}
        <div>
          <label className="block text-sm font-medium mb-2">Default Export Quality</label>
          <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600">
            <option>1080p (Full HD)</option>
            <option>720p (HD)</option>
            <option>4K (Ultra HD)</option>
          </select>
        </div>

        {/* Auto-save */}
        <div className="flex items-center justify-between py-4 border-t border-zinc-800">
          <div className="flex-1">
            <div className="font-medium mb-1">Auto-save drafts</div>
            <div className="text-sm text-gray-400">Automatically save your work in progress</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
          </label>
        </div>

        <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
