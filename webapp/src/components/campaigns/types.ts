export type FrequencyOption =
  | "all-once"
  | "hourly"
  | "two-hours"
  | "six-hours"
  | "daily"
  | "custom";

export type CampaignType = "one-time" | "repetitive";
export type CampaignDuration = "3" | "7" | "14" | "30" | "60" | "90" | "continuous";
export type PostsPerDay = "1-3" | "5-10" | "10-15" | "15-20" | "custom";
export type PostingInterval = "30min-1hr" | "1-2hr" | "2-4hr" | "4-6hr" | "random";
export type VariationMethod = "ai-powered" | "manual";
export type VariationIntensity = "light" | "medium" | "aggressive";

export type ClipSortOption = "recent" | "oldest" | "duration";

export type PlatformKey = "tiktok" | "youtube" | "instagram" | "twitter";

export interface Clip {
  id: string;
  title: string;
  duration: number;
  score: number;
  createdAt: string;
  platform: PlatformKey;
  thumbnail?: string | null;
  clipUrl?: string | null;
  fileSize?: number | null;
}

export interface Account {
  id: string;
  platform: PlatformKey;
  accountName: string;
  followers: number;
}

export interface TimelinePost {
  id: string;
  clipTitle: string;
  postTime: Date;
  accountName: string;
  platform: PlatformKey;
  index: number;
}

export interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

