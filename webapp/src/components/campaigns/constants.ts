import type { FrequencyOption, ClipSortOption, PlatformKey, Account } from "./types";

export const FREQUENCY_OPTIONS: Array<{ label: string; value: FrequencyOption; description?: string }> = [
  { label: "Post All at Once", value: "all-once", description: "Instant drop" },
  { label: "Hourly Distribution", value: "hourly", description: "1 post/hour" },
  { label: "Every 2 Hours", value: "two-hours", description: "1 post/2 hours" },
  { label: "Every 6 Hours", value: "six-hours", description: "1 post/6 hours" },
  { label: "Daily Distribution", value: "daily", description: "1 post/day, same time" },
  { label: "Custom Interval", value: "custom", description: "Set your own pace" },
];

export const CLIP_SORT_OPTIONS: Array<{ label: string; value: ClipSortOption }> = [
  { label: "Recent", value: "recent" },
  { label: "Oldest", value: "oldest" },
  { label: "Duration", value: "duration" },
];

export const PLATFORM_META: Record<PlatformKey, { label: string; dotClass: string; pillBg: string; charLimit: number; accentColor: string }> = {
  tiktok: {
    label: "TikTok",
    dotClass: "bg-gradient-to-r from-pink-500 to-cyan-400",
    pillBg: "bg-pink-500/20 border-pink-500/40",
    charLimit: 2200,
    accentColor: "pink",
  },
  youtube: {
    label: "YouTube",
    dotClass: "bg-red-500",
    pillBg: "bg-red-500/20 border-red-500/40",
    charLimit: 5000,
    accentColor: "red",
  },
  instagram: {
    label: "Instagram",
    dotClass: "bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400",
    pillBg: "bg-purple-500/20 border-purple-500/40",
    charLimit: 2200,
    accentColor: "purple",
  },
  twitter: {
    label: "Twitter/X",
    dotClass: "bg-sky-400",
    pillBg: "bg-sky-400/20 border-sky-400/40",
    charLimit: 280,
    accentColor: "sky",
  },
};

export const PLATFORM_SHORT_LABEL: Record<PlatformKey, string> = {
  tiktok: "TT",
  youtube: "YT",
  instagram: "IG",
  twitter: "X",
};

export const QUICK_TEMPLATES = [
  { label: "Hook + Value", content: "🚨 This changed everything for me! Here's what I learned...\n\n{clip_title}" },
  { label: "Story", content: "Let me tell you about the time I discovered this...\n\n{clip_title}" },
  { label: "Question", content: "Have you ever wondered why...? Here's the answer 👇\n\n{clip_title}" },
  { label: "Direct", content: "Check this out! 🔥\n\n{clip_title}" },
];

export const PLATFORM_BEST_PRACTICES: Record<PlatformKey, string[]> = {
  tiktok: ["Start with hook/emoji", "3-5 hashtags max", "Keep it punchy & short", "Use trending sounds/hashtags"],
  youtube: ["SEO-optimized titles", "Detailed descriptions", "Include timestamps", "Add links in description"],
  instagram: ["Engaging first line", "Use line breaks", "Max 30 hashtags", "Include call-to-action"],
  twitter: ["Keep it under 280 chars", "Use 1-2 hashtags max", "Tag relevant accounts", "Thread for longer content"],
};

export const AI_VARIATION_EXAMPLES = {
  original: "Check this out! 🔥",
  variants: [
    "You won't believe this! 🤯",
    "This is insane 💯",
    "Must watch! 🎯",
    "Wait for it... 😱",
  ],
};

export const CTA_OPTIONS = [
  "Follow for more",
  "Like if you agree",
  "Comment your thoughts",
  "Share with friends",
  "Save for later",
  "Turn on notifications",
];

export const TOTAL_SECTIONS = 4;

export const mockAccounts: Account[] = [
  {
    id: "acct-1",
    platform: "tiktok",
    accountName: "@scaleposthq",
    followers: 10500,
  },
  {
    id: "acct-2",
    platform: "tiktok",
    accountName: "@scalepost.creator",
    followers: 8900,
  },
  {
    id: "acct-3",
    platform: "youtube",
    accountName: "Scalepost Official",
    followers: 50000,
  },
  {
    id: "acct-4",
    platform: "youtube",
    accountName: "Scalepost Clips",
    followers: 12000,
  },
  {
    id: "acct-5",
    platform: "instagram",
    accountName: "@scaleposthq",
    followers: 15000,
  },
  {
    id: "acct-6",
    platform: "instagram",
    accountName: "@scalepost_pro",
    followers: 7500,
  },
  {
    id: "acct-7",
    platform: "twitter",
    accountName: "@ScalepostHQ",
    followers: 5000,
  },
  {
    id: "acct-8",
    platform: "twitter",
    accountName: "@ScalepostNews",
    followers: 3200,
  },
];

export const today = new Date();
export const defaultDate = today.toISOString().slice(0, 10);
export const sevenDaysLater = new Date(today);
sevenDaysLater.setDate(today.getDate() + 7);
export const defaultEndDate = sevenDaysLater.toISOString().slice(0, 10);
export const defaultTime = `${today.getHours().toString().padStart(2, "0")}:${today
  .getMinutes()
  .toString()
  .padStart(2, "0")}`;

