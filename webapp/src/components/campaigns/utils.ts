import type { FrequencyOption, Clip, Account, TimelinePost } from "./types";
import { FREQUENCY_OPTIONS } from "./constants";

export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

export function formatDateTime(date: string, time: string) {
  if (!date || !time) return "";
  const iso = `${date}T${time}`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getFrequencyLabel(value: FrequencyOption) {
  return FREQUENCY_OPTIONS.find((option) => option.value === value)?.label ?? "Post All Once";
}

export function buildTimelinePreview(
  frequency: FrequencyOption,
  date: string,
  time: string,
  clips: Clip[],
  accounts: Account[],
  customInterval: number,
  customIntervalUnit: "minutes" | "hours" | "days"
): TimelinePost[] {
  if (clips.length === 0 || accounts.length === 0) {
    return [];
  }

  const base = date && time 
    ? new Date(`${date}T${time}`)
    : new Date();
    
  if (Number.isNaN(base.getTime())) {
    return [];
  }

  let intervalMs = 0;
  
  if (frequency === "hourly") {
    intervalMs = 60 * 60 * 1000;
  } else if (frequency === "two-hours") {
    intervalMs = 2 * 60 * 60 * 1000;
  } else if (frequency === "six-hours") {
    intervalMs = 6 * 60 * 60 * 1000;
  } else if (frequency === "daily") {
    intervalMs = 24 * 60 * 60 * 1000;
  } else if (frequency === "custom") {
    const multiplier = customIntervalUnit === "minutes" ? 60 * 1000 
      : customIntervalUnit === "hours" ? 60 * 60 * 1000 
      : 24 * 60 * 60 * 1000;
    intervalMs = customInterval * multiplier;
  }

  const results: TimelinePost[] = [];
  let postIndex = 0;

  for (const clip of clips) {
    for (const account of accounts) {
      const postDate = frequency === "all-once" 
        ? base 
        : new Date(base.getTime() + postIndex * intervalMs);
      
      results.push({
        id: `${clip.id}-${account.id}-${postIndex}`,
        clipTitle: clip.title,
        accountName: account.accountName,
        platform: account.platform,
        postTime: postDate,
        index: postIndex + 1,
      });
      
      postIndex++;
    }
  }
  
  return results;
}

