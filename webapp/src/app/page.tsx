// src/app/page.tsx
"use client";

import Link from "next/link";

const navItems = [
  { name: "Dashboard", href: "#" },
  { name: "Campaigns", href: "#campaigns" },
  { name: "Videos", href: "#videos" },
  { name: "Accounts", href: "#accounts" },
  { name: "Library", href: "#library" },
  { name: "Plugins", href: "#plugins" },
  { name: "Settings", href: "#settings" },
];

const quickStats = [
  { label: "Active campaigns", value: "12", trend: "+3 this week" },
  { label: "Scheduled shorts", value: "84", trend: "12 publish today" },
  { label: "Clip runtime saved", value: "46h", trend: "AI automations" },
  { label: "Connected accounts", value: "28", trend: "7 platforms" },
];

const campaignHighlights = [
  {
    title: "YouTube repurpose sprint",
    status: "Live • Ends in 3d",
    metric: "18 clips auto-posted",
    description:
      "Daily republishing of top long-form segments clipped with Opus and auto-captioned for Shorts.",
  },
  {
    title: "TikTok product launch",
    status: "Draft • Needs approval",
    metric: "12 clips queued",
    description:
      "Multi-angle edits with branded templates scheduled to roll out over the next 10 days.",
  },
];

const recentVideos = [
  {
    title: "How to script viral hooks",
    platform: "Reels",
    performance: "132k views",
    status: "Auto-scheduled",
  },
  {
    title: "Podcast ep 48 highlight",
    platform: "Shorts",
    performance: "78k views",
    status: "Published 2h ago",
  },
  {
    title: "Founder Q&A clip",
    platform: "TikTok",
    performance: "54k views",
    status: "Queued",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-[120rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-black/30 px-8 py-10 md:flex">
          <div className="mb-12">
            <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Scalepost</span>
            <h1 className="mt-3 text-2xl font-semibold">Automation Hub</h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage every campaign, clip, and account from a single command center.
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-300">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="rounded-lg px-4 py-2 transition hover:bg-white/10 hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
            <p className="font-semibold text-white">Need more automation?</p>
            <p className="mt-2">
              Connect additional workspaces and unlock API-based publishing for enterprise workflows.
            </p>
            <Link
              href="#plugins"
              className="mt-3 inline-flex items-center text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Explore plugins →
            </Link>
          </div>
        </aside>

        <section className="flex-1 px-6 py-10 md:px-12">
          <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Dashboard overview</h2>
              <p className="mt-2 max-w-2xl text-slate-400">
                Track automation performance, review AI-generated clips, and coordinate campaigns across every connected
                channel.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                New campaign
              </button>
              <button className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30">
                Upload long-form video
              </button>
            </div>
          </header>

          <div className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-wide text-slate-400">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-cyan-300">{stat.trend}</p>
              </div>
            ))}
          </div>

          <div id="campaigns" className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Campaign pipeline</h3>
                <Link href="#" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                  View all
                </Link>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Align your distribution calendar and keep clips moving from AI draft to live post.
              </p>
              <div className="mt-6 space-y-5">
                {campaignHighlights.map((campaign) => (
                  <div key={campaign.title} className="rounded-xl border border-white/10 bg-black/40 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
                      <span className="font-semibold text-white">{campaign.title}</span>
                      <span>{campaign.status}</span>
                    </div>
                    <p className="mt-3 text-base text-white/90">{campaign.metric}</p>
                    <p className="mt-2 text-sm text-slate-400">{campaign.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="plugins" className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-transparent p-6">
                <h3 className="text-xl font-semibold text-white">Automation health</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                  <li>• 98% of scheduled posts synced successfully this week.</li>
                  <li>• Opus Clips processing queue averaging 3m per long-form upload.</li>
                  <li>• 4 plugins with updates available for review.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">Workspace notes</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>• Import new brand accounts to the Accounts tab for June launch.</li>
                  <li>• Refresh evergreen clips in the Library to rehash for TikTok testing.</li>
                  <li>• Enable beta analytics plugin for deeper retention tracking.</li>
                </ul>
              </div>
            </div>
          </div>

          <div id="videos" className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Recent AI-generated clips</h3>
              <Link href="#" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                Manage videos
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {recentVideos.map((video) => (
                <div key={video.title} className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <p className="text-sm uppercase tracking-wide text-slate-400">{video.platform}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{video.title}</p>
                  <p className="mt-2 text-sm text-slate-300">{video.performance}</p>
                  <p className="mt-4 text-xs text-cyan-300">{video.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="accounts" className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-semibold text-white">Accounts overview</h3>
              <p className="mt-3 text-sm text-slate-400">
                Centralize credentials and assign automations to each brand channel.
              </p>
              <ul className="mt-5 space-y-4 text-sm text-slate-300">
                <li>• 12 YouTube channels synced with scheduling automation.</li>
                <li>• 8 TikTok profiles managed with daily repost sequences.</li>
                <li>• 6 Instagram accounts connected with brand templates.</li>
              </ul>
            </div>
            <div id="library" className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-semibold text-white">Library status</h3>
              <p className="mt-3 text-sm text-slate-400">
                Templates, scripts, and approved assets ready for the next clip batch.
              </p>
              <ul className="mt-5 space-y-4 text-sm text-slate-300">
                <li>• 34 intro/outro templates active.</li>
                <li>• 120 approved hooks tagged by persona.</li>
                <li>• 56 background tracks cleared for auto-use.</li>
              </ul>
            </div>
          </div>

          <div id="settings" className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold text-white">Settings & plugins</h3>
            <p className="mt-3 text-sm text-slate-400">
              Configure publishing windows, permissions, and extend Scalepost with additional automation plugins.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm font-semibold text-white">Publishing windows</p>
                <p className="mt-2 text-xs text-slate-300">Quiet hours enabled 9pm-6am local time.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm font-semibold text-white">Team permissions</p>
                <p className="mt-2 text-xs text-slate-300">Editors can approve clips, managers deploy campaigns.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm font-semibold text-white">Plugin marketplace</p>
                <p className="mt-2 text-xs text-slate-300">Connect analytics, commerce, and CRM destinations.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
