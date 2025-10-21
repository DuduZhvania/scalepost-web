// src/app/library/page.tsx
"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUploadModal } from "@/hooks/useUploadModal";
import { StatsPanel } from "@/components/library/StatsPanel";
import {
  Play,
  Scissors,
  TrendingUp,
  Trash2,
  Upload,
  Link as LinkIcon,
  Loader2,
  Youtube,
  Music,
  Radio,
  Video,
  ExternalLink,
  ArrowUpDown,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  Filter,
  MoreVertical,
  Search,
  Sparkles,
  RefreshCcw,
  Circle,
  X as CloseIcon,
} from "lucide-react";

type MediaAsset = {
  id: string;
  url: string;
  status: string;
  createdAt: string;
  durationS?: number | null;
  fileSize?: number | null;
  userId?: string | null;
  title?: string | null;
  originalFilename?: string | null;
  type: "file" | "link";
  sourceUrl?: string | null;
  clipCount: number;
  thumbnail?: string | null;
};

type ClipItem = {
  id: string;
  mediaAssetId: string;
  title?: string | null;
  clipUrl: string;
  duration: number;
  thumbnail?: string | null;
  status: string;
  createdAt: string;
  score?: number | null;
  assetFileName?: string | null;
  assetStatus?: string | null;
};

type ActionSnapshot = {
  generating: boolean;
  deleting: boolean;
  renaming: boolean;
  message?: string;
};

type ActionState = Record<string, ActionSnapshot>;

type TabKey = "all" | "videos" | "links" | "clips";

const TABS: { id: TabKey; label: string }[] = [
  { id: "all", label: "All" },
  { id: "videos", label: "Videos" },
  { id: "links", label: "Links" },
  { id: "clips", label: "Clips" },
];

type SortOption = "recent" | "oldest" | "most-clips" | "alphabetical";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "recent", label: "Recent" },
  { id: "oldest", label: "Oldest" },
  { id: "most-clips", label: "Most Clips" },
  { id: "alphabetical", label: "A-Z" },
];

const FILTER_CHIPS: Array<{ id: string; label: string; type: "status" | "platform" }> = [
  { id: "all-platforms", label: "All Platforms", type: "platform" },
  { id: "status-posted", label: "Posted", type: "status" },
  { id: "status-processing", label: "Processing", type: "status" },
  { id: "status-ready", label: "Ready", type: "status" },
  { id: "status-failed", label: "Failed", type: "status" },
  { id: "status-draft", label: "Draft", type: "status" },
];

const STATUS_TOKEN_CLASSES: Record<string, string> = {
  posted: "bg-blue-400",
  processing: "bg-amber-400",
  ready: "bg-emerald-400",
  failed: "bg-red-400",
  draft: "bg-zinc-400",
};

const TAB_DESCRIPTIONS: Record<TabKey, string> = {
  all: "Everything in one dashboard",
  videos: "Original uploads and source files",
  links: "Imports and reference links",
  clips: "Generated highlights and snippets",
};

const DEFAULT_VIEW_MODE: "grid" | "list" = "grid";

const DEFAULT_ACTION_FLAGS = {
  generating: false,
  deleting: false,
  renaming: false,
} as const;

const mergeWithDefaults = (value?: ActionSnapshot): ActionSnapshot => ({
  ...DEFAULT_ACTION_FLAGS,
  ...(value ?? {}),
});

type TabData = {
  all: MediaAsset[];
  videos: MediaAsset[];
  links: MediaAsset[];
  clips: ClipItem[];
};

type VideoPlayerState = {
  isOpen: boolean;
  url: string;
  title: string;
  duration?: number;
};

const INITIAL_VIDEO_PLAYER_STATE: VideoPlayerState = {
  isOpen: false,
  url: "",
  title: "",
  duration: undefined,
};

function formatDuration(value: number | null | undefined) {
  if (!value || Number.isNaN(value) || value <= 0) return "";
  const seconds = Math.round(value);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}:${remainingMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type StatusMeta = {
  label: string;
  badgeClass: string;
  indicatorClass: string;
  Icon: typeof CheckCircle2;
  iconClass?: string;
};

const STATUS_META: Record<string, StatusMeta> = {
  ready: {
    label: "Ready",
    badgeClass:
      "border border-emerald-400/50 bg-emerald-500/10 text-emerald-200",
    indicatorClass: "bg-emerald-400 animate-[pulseGlow_2.2s_ease-in-out_infinite]",
    Icon: CheckCircle2,
  },
  uploaded: {
    label: "Uploaded",
    badgeClass:
      "border border-indigo-400/40 bg-indigo-500/10 text-indigo-200",
    indicatorClass: "bg-indigo-400 animate-[pulseGlow_2.2s_ease-in-out_infinite]",
    Icon: CheckCircle2,
  },
  posted: {
    label: "Posted",
    badgeClass: "border border-blue-400/50 bg-blue-500/10 text-blue-200",
    indicatorClass: "bg-blue-400 animate-[pulseGlow_2.2s_ease-in-out_infinite]",
    Icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    badgeClass: "border border-amber-400/50 bg-amber-500/10 text-amber-200",
    indicatorClass:
      "bg-amber-400 animate-[pulseGlow_1.6s_ease-in-out_infinite]",
    Icon: Loader2,
    iconClass: "animate-spin",
  },
  failed: {
    label: "Failed",
    badgeClass: "border border-red-400/50 bg-red-500/10 text-red-200",
    indicatorClass: "bg-red-400 animate-[pulseGlow_1.8s_ease-in-out_infinite]",
    Icon: AlertTriangle,
  },
  draft: {
    label: "Draft",
    badgeClass: "border border-zinc-500/40 bg-zinc-500/10 text-zinc-200",
    indicatorClass: "bg-zinc-400",
    Icon: Circle,
  },
  default: {
    label: "Pending",
    badgeClass: "border border-zinc-500/40 bg-zinc-800/60 text-zinc-200",
    indicatorClass: "bg-zinc-500",
    Icon: Circle,
  },
};

function getStatusMeta(status: string): StatusMeta {
  const key = status?.toLowerCase() ?? "";
  return STATUS_META[key] ?? STATUS_META.default;
}

function pluralizeClips(count: number) {
  const safe = Number.isFinite(count) ? Math.max(count, 0) : 0;
  return safe === 1 ? "1 clip" : `${safe} clips`;
}

function getFriendlyName(asset: MediaAsset) {
  return (
    asset.title ??
    asset.originalFilename ??
    asset.url.split("/").pop() ??
    asset.id
  );
}

function normalizeDate(value: unknown) {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function getPlatformDetails(rawUrl?: string | null) {
  if (!rawUrl) {
    return { icon: LinkIcon, name: "Link", color: "text-zinc-400" };
  }

  try {
    const hostname = new URL(rawUrl).hostname.toLowerCase();
    if (hostname.includes("youtube") || hostname.includes("youtu.be")) {
      return { icon: Youtube, name: "YouTube", color: "text-red-400" };
    }
    if (hostname.includes("spotify")) {
      return { icon: Music, name: "Spotify", color: "text-green-400" };
    }
    if (hostname.includes("soundcloud")) {
      return { icon: Radio, name: "SoundCloud", color: "text-orange-400" };
    }
    if (hostname.includes("tiktok")) {
      return { icon: Video, name: "TikTok", color: "text-cyan-400" };
    }
    if (hostname.includes("vimeo")) {
      return { icon: Video, name: "Vimeo", color: "text-blue-400" };
    }
    return { icon: LinkIcon, name: hostname.replace("www.", ""), color: "text-zinc-400" };
  } catch {
    return { icon: LinkIcon, name: "Link", color: "text-zinc-400" };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? [...value] : [];
}

function readString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function readStringOr(value: unknown, fallback: string): string {
  return readString(value) ?? fallback;
}

function readNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function readNumberOr(value: unknown, fallback: number): number {
  const parsed = readNullableNumber(value);
  return parsed ?? fallback;
}

function getStringField(
  record: Record<string, unknown>,
  key: string
): string | null {
  return readString(record[key]);
}

function getNumberField(
  record: Record<string, unknown>,
  key: string
): number | null {
  return readNullableNumber(record[key]);
}

function extractArrayField(
  record: Record<string, unknown>,
  key: string
): unknown[] {
  const value = record[key];
  return toArray(value);
}

function normalizeClip(raw: unknown): ClipItem {
  if (!isRecord(raw)) {
    return {
      id: "clip-unknown",
      mediaAssetId: "unknown",
      title: null,
      clipUrl: "",
      duration: 0,
      thumbnail: null,
      status: "ready",
      createdAt: normalizeDate(undefined),
      score: null,
      assetFileName: null,
      assetStatus: null,
    };
  }

  const record = raw;

  // Get thumbnail from clip first, then fall back to asset thumbnail
  // Don't use assetFileUrl as it's a video, not a thumbnail
  const thumbnail =
    getStringField(record, "thumbnail") ??
    null;

  const score = getNumberField(record, "score");

  return {
    id: readStringOr(record["id"], "clip-unknown"),
    mediaAssetId: readStringOr(record["mediaAssetId"], "unknown"),
    title:
      getStringField(record, "title") ??
      getStringField(record, "assetFileName") ??
      null,
    clipUrl: readStringOr(record["clipUrl"], ""),
    duration: readNumberOr(record["duration"], 0),
    thumbnail,
    status: readStringOr(record["status"], "ready"),
    createdAt: normalizeDate(record["createdAt"]),
    score: score ?? null,
    assetFileName: getStringField(record, "assetFileName"),
    assetStatus: getStringField(record, "assetStatus"),
  };
}

function normalizeMediaAsset(
  raw: unknown,
  defaultType: "file" | "link"
): MediaAsset {
  if (!isRecord(raw)) {
    return {
      id: "unknown",
      url: "",
      status: "uploaded",
      createdAt: normalizeDate(undefined),
      durationS: null,
      fileSize: null,
      userId: null,
      title: null,
      originalFilename: null,
      type: defaultType,
      sourceUrl: null,
      clipCount: 0,
      thumbnail: null,
    };
  }

  const record = raw;

  const metadata = isRecord(record["metadata"])
    ? (record["metadata"] as Record<string, unknown>)
    : undefined;
  const metadataDuration = metadata
    ? getNumberField(metadata, "duration")
    : null;

  const rawType = readString(record["type"]);
  const resolvedType =
    rawType === "link" ? "link" : rawType === "file" ? "file" : defaultType;

  const url =
    getStringField(record, "url") ??
    getStringField(record, "fileUrl") ??
    getStringField(record, "assetUrl") ??
    "";

  const clipCount = Math.max(
    0,
    Math.trunc(readNumberOr(record["clipCount"], 0))
  );

  return {
    id: readStringOr(record["id"], "unknown"),
    url,
    status: readStringOr(record["status"], "uploaded"),
    createdAt: normalizeDate(record["createdAt"]),
    durationS:
      readNullableNumber(record["durationS"]) ??
      readNullableNumber(record["duration"]) ??
      metadataDuration,
    fileSize: readNullableNumber(record["fileSize"]),
    userId: getStringField(record, "userId"),
    title:
      getStringField(record, "title") ??
      getStringField(record, "originalFilename") ??
      null,
    originalFilename:
      getStringField(record, "originalFilename") ??
      getStringField(record, "fileName") ??
      null,
    type: resolvedType,
    sourceUrl: getStringField(record, "sourceUrl"),
    clipCount,
    thumbnail: getStringField(record, "thumbnail"),
  };
}

function extractClipsFromPayload(payload: unknown): unknown[] {
  if (!isRecord(payload)) {
    return [];
  }
  return extractArrayField(payload, "clips");
}

export default function LibraryPage() {
  const { open } = useUploadModal();
  const [tabData, setTabData] = useState<TabData>({
    all: [],
    videos: [],
    links: [],
    clips: [],
  });
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actionState, setActionState] = useState<ActionState>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">(DEFAULT_VIEW_MODE);
  const [activeFilterChips, setActiveFilterChips] = useState<Set<string>>(
    () => new Set(["all-platforms"])
  );
  const [refreshing, setRefreshing] = useState(false);
  const [openContextId, setOpenContextId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] =
    useState<"generate" | "add" | "delete" | null>(null);
  const [videoPlayer, setVideoPlayer] =
    useState<VideoPlayerState>(INITIAL_VIDEO_PLAYER_STATE);
  const [statsPanel, setStatsPanel] = useState<{
    isOpen: boolean;
    type: 'video' | 'clip';
    data: Record<string, unknown> | null;
  }>({
    isOpen: false,
    type: 'video',
    data: null,
  });
  const loadedTabsRef = useRef(new Set<TabKey>());
  const closeVideoPlayer = useCallback(() => {
    setVideoPlayer(() => ({ ...INITIAL_VIDEO_PLAYER_STATE }));
  }, []);

  useEffect(() => {
    if (!videoPlayer.isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeVideoPlayer();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeVideoPlayer, videoPlayer.isOpen]);

  const loadTabData = useCallback(
    async (tab: TabKey, options?: { silent?: boolean }) => {
      const showSpinner = !(options?.silent ?? false);
      if (showSpinner) {
        setLoading(true);
        setError(undefined);
      }

      try {
        if (tab === "clips") {
          const response = await fetch("/api/clip?all=1", {
            cache: "no-store",
          });
          const payload = await response.json().catch(() => undefined);

          if (!response.ok) {
            const message =
              payload && typeof payload === "object" && "error" in payload
                ? (payload as { error?: string }).error
                : undefined;
            throw new Error(message ?? "Unable to load clips.");
          }

          const normalized = extractClipsFromPayload(payload).map(normalizeClip);

          setTabData((prev) => ({ ...prev, clips: normalized }));
        } else if (tab === "all") {
          // For "all" tab, fetch both videos AND clips (exclude links)
          const [videosResponse, clipsResponse] = await Promise.all([
            fetch("/api/media-assets?type=file", { cache: "no-store" }),
            fetch("/api/clip?all=1", { cache: "no-store" }),
          ]);

          const videosPayload = await videosResponse.json().catch(() => []);
          const clipsPayload = await clipsResponse.json().catch(() => ({ clips: [] }));

          if (!videosResponse.ok) {
            throw new Error("Unable to load videos.");
          }

          const normalizedVideos = toArray(videosPayload).map((asset) =>
            normalizeMediaAsset(asset, "file")
          );

          const normalizedClips = extractClipsFromPayload(clipsPayload).map(
            normalizeClip
          );

          // Fetch all assets to separate videos and links
          const allAssetsResponse = await fetch("/api/media-assets", { cache: "no-store" });
          const allAssetsPayload = await allAssetsResponse.json().catch(() => []);

          const allNormalized = toArray(allAssetsPayload).map((asset) =>
            normalizeMediaAsset(asset, "file")
          );

          const videos = allNormalized.filter((asset) => asset.type === "file");
          const links = allNormalized.filter((asset) => asset.type === "link");

          setTabData((prev) => ({
            ...prev,
            all: normalizedVideos, // Only videos (clips are stored separately)
            videos,
            links,
            clips: normalizedClips,
          }));
        } else {
          const query = tab === "videos" ? "?type=file" : "?type=link";
          const response = await fetch(`/api/media-assets${query}`, {
            cache: "no-store",
          });
          const payload = await response.json().catch(() => undefined);

          if (!response.ok) {
            const message =
              payload && typeof payload === "object" && "error" in payload
                ? (payload as { error?: string }).error
                : undefined;
            throw new Error(message ?? "Unable to load your media assets.");
          }

          const normalized = toArray(payload).map((asset) =>
            normalizeMediaAsset(asset, tab === "links" ? "link" : "file")
          );

          setTabData((prev) => {
            if (tab === "videos") {
              return { ...prev, videos: normalized };
            }
            return { ...prev, links: normalized };
          });
        }

        loadedTabsRef.current.add(tab);
      } catch (err) {
        console.error("Failed to load library data:", err);
        if (showSpinner) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again."
          );
        }
      } finally {
        if (showSpinner) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    setSelectedIds(new Set());
    setError(undefined);

    if (loadedTabsRef.current.has(activeTab)) {
      setLoading(false);
      return;
    }

    void loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  useEffect(() => {
    const handleUploaded = () => {
      loadedTabsRef.current.delete("all");
      void loadTabData("all", { silent: activeTab !== "all" });

      if (activeTab !== "all" && activeTab !== "clips") {
        loadedTabsRef.current.delete(activeTab);
        void loadTabData(activeTab, { silent: true });
      }
    };

    const handleBatchComplete = () => {
      // Final refresh after all uploads complete
      loadedTabsRef.current.delete("all");
      void loadTabData("all", { silent: false });

      if (activeTab !== "all" && activeTab !== "clips") {
        loadedTabsRef.current.delete(activeTab);
        void loadTabData(activeTab, { silent: false });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("media:uploaded", handleUploaded);
      window.addEventListener("media:batch-complete", handleBatchComplete);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("media:uploaded", handleUploaded);
        window.removeEventListener("media:batch-complete", handleBatchComplete);
      }
    };
  }, [activeTab, loadTabData]);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        !target.closest("[data-context-menu]") &&
        !target.closest("[data-context-menu-trigger]")
      ) {
        setOpenContextId(null);
      }
    };

    document.addEventListener("click", handleClickAway);
    return () => {
      document.removeEventListener("click", handleClickAway);
    };
  }, []);

  const normalizedSearchTerm = useMemo(
    () => searchTerm.trim().toLowerCase(),
    [searchTerm]
  );

  const statusFilters = useMemo(
    () =>
      Array.from(activeFilterChips)
        .filter((chip) => chip.startsWith("status-"))
        .map((chip) => chip.replace("status-", "")),
    [activeFilterChips]
  );

  const platformFilters = useMemo(
    () =>
      Array.from(activeFilterChips).filter((chip) =>
        chip.startsWith("platform-")
      ),
    [activeFilterChips]
  );

  const assetMatchesFilters = useCallback(
    (asset: MediaAsset) => {
      const loweredStatus = (asset.status ?? "").toLowerCase();
      if (statusFilters.length > 0 && !statusFilters.includes(loweredStatus)) {
        return false;
      }

      if (platformFilters.length > 0) {
        const platformSlug = getPlatformDetails(
          asset.sourceUrl ?? asset.url
        ).name
          .toLowerCase()
          .replace(/\s+/g, "-");
        const platformToken = `platform-${platformSlug}`;
        if (!platformFilters.includes(platformToken)) {
          return false;
        }
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const searchPool: string[] = [
        getFriendlyName(asset),
        asset.originalFilename ?? "",
        asset.url ?? "",
        asset.sourceUrl ?? "",
        asset.status ?? "",
      ];

      return searchPool.some((value) =>
        value.toLowerCase().includes(normalizedSearchTerm)
      );
    },
    [normalizedSearchTerm, platformFilters, statusFilters]
  );

  const clipMatchesFilters = useCallback(
    (clip: ClipItem) => {
      const loweredStatus = (clip.status ?? "").toLowerCase();
      if (statusFilters.length > 0 && !statusFilters.includes(loweredStatus)) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const searchPool: string[] = [
        clip.title ?? "",
        clip.assetFileName ?? "",
        clip.clipUrl ?? "",
        clip.status ?? "",
      ];

      return searchPool.some((value) =>
        value.toLowerCase().includes(normalizedSearchTerm)
      );
    },
    [normalizedSearchTerm, statusFilters]
  );

  const filteredVideos = useMemo(
    () => tabData.videos.filter(assetMatchesFilters),
    [assetMatchesFilters, tabData.videos]
  );

  const filteredLinks = useMemo(
    () => tabData.links.filter(assetMatchesFilters),
    [assetMatchesFilters, tabData.links]
  );

  const filteredAllVideos = useMemo(
    () => tabData.all.filter(assetMatchesFilters),
    [assetMatchesFilters, tabData.all]
  );

  const filteredClips = useMemo(
    () => tabData.clips.filter(clipMatchesFilters),
    [clipMatchesFilters, tabData.clips]
  );

  const sortAssets = useCallback(
    (list: MediaAsset[]) => {
      const items = list.slice();
      console.log('🔄 Sorting assets by:', sortOption, '- Count:', items.length);
      
      switch (sortOption) {
        case "alphabetical":
          items.sort((a, b) =>
            getFriendlyName(a).localeCompare(getFriendlyName(b))
          );
          break;
        case "most-clips":
          items.sort((a, b) => {
            const diff = (b.clipCount ?? 0) - (a.clipCount ?? 0);
            if (diff !== 0) return diff;
            return (
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
            );
          });
          break;
        case "oldest":
          items.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          );
          break;
        case "recent":
        default:
          items.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );
          break;
      }
      
      console.log('✅ Sorted:', items.slice(0, 3).map(a => ({ 
        name: getFriendlyName(a), 
        date: a.createdAt,
        clips: a.clipCount 
      })));
      
      return items;
    },
    [sortOption]
  );

  const sortClips = useCallback(
    (list: ClipItem[]) => {
      const items = list.slice();
      switch (sortOption) {
        case "alphabetical":
          items.sort((a, b) => {
            const titleA = (
              a.title ??
              a.assetFileName ??
              `clip-${a.id}`
            ).toLowerCase();
            const titleB = (
              b.title ??
              b.assetFileName ??
              `clip-${b.id}`
            ).toLowerCase();
            return titleA.localeCompare(titleB);
          });
          break;
        case "oldest":
          items.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          );
          break;
        case "recent":
        case "most-clips":
        default:
          items.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );
          break;
      }
      return items;
    },
    [sortOption]
  );

  const sortedVideos = useMemo(
    () => sortAssets(filteredVideos),
    [filteredVideos, sortAssets]
  );

  const sortedLinks = useMemo(
    () => sortAssets(filteredLinks),
    [filteredLinks, sortAssets]
  );

  const sortedAllVideos = useMemo(
    () => sortAssets(filteredAllVideos),
    [filteredAllVideos, sortAssets]
  );

  const sortedClips = useMemo(
    () => sortClips(filteredClips),
    [filteredClips, sortClips]
  );

  const sortedAssets = useMemo(() => {
    if (activeTab === "videos") return sortedVideos;
    if (activeTab === "links") return sortedLinks;
    if (activeTab === "all") return sortedAllVideos;
    return [];
  }, [activeTab, sortedAllVideos, sortedLinks, sortedVideos]);

  const tabCounts = useMemo(
    () => ({
      all: sortedAllVideos.length + sortedClips.length,
      videos: sortedVideos.length,
      links: sortedLinks.length,
      clips: sortedClips.length,
    }),
    [sortedAllVideos, sortedClips, sortedLinks, sortedVideos]
  );

  const activeTabIndex = useMemo(
    () => TABS.findIndex((tab) => tab.id === activeTab),
    [activeTab]
  );

  const showClearFilters = useMemo(
    () =>
      normalizedSearchTerm.length > 0 ||
      statusFilters.length > 0 ||
      platformFilters.length > 0,
    [normalizedSearchTerm, platformFilters, statusFilters]
  );

  const isGridView = viewMode === "grid";

  const selectedAssetIds = useMemo(
    () => Array.from(selectedIds).filter((id) => !id.startsWith("clip-")),
    [selectedIds]
  );

  const selectedClipIds = useMemo(
    () =>
      Array.from(selectedIds)
        .filter((id) => id.startsWith("clip-"))
        .map((id) => id.replace("clip-", "")),
    [selectedIds]
  );

  const selectedClipObjects = useMemo(
    () =>
      tabData.clips.filter((clip) => selectedClipIds.includes(clip.id)),
    [selectedClipIds, tabData.clips]
  );

  const selectedCount = selectedIds.size;
  const hasSelectedAssets = selectedAssetIds.length > 0;
  const hasSelectedClips = selectedClipObjects.length > 0;
  const isBulkBusy = bulkAction !== null;

  // For "All" tab, combine videos and clips
  const allTabItems = useMemo(() => {
    if (activeTab !== "all") return [];

    // Create a combined list with type discriminator
    const items: Array<{ type: "video" | "clip"; data: MediaAsset | ClipItem }> = [
      ...sortedAllVideos.map((asset) => ({ type: "video" as const, data: asset })),
      ...sortedClips.map((clip) => ({ type: "clip" as const, data: clip })),
    ];

    // Sort by creation date
    return items.sort((a, b) => {
      const dateA = new Date(a.data.createdAt).getTime();
      const dateB = new Date(b.data.createdAt).getTime();
      return dateB - dateA;
    });
  }, [activeTab, sortedAllVideos, sortedClips]);

  const updateAssets = useCallback(
    (updater: (asset: MediaAsset) => MediaAsset) => {
      setTabData((prev) => ({
        ...prev,
        all: prev.all.map(updater),
        videos: prev.videos.map(updater),
        links: prev.links.map(updater),
      }));
    },
    []
  );

  const handleAddToClips = async (assetId: string) => {
    setActionState((prev) => ({
      ...prev,
      [assetId]: {
        ...mergeWithDefaults(prev[assetId]),
        generating: true,
        renaming: false,
        message: undefined,
      },
    }));

    try {
      const response = await fetch("/api/clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaAssetId: assetId,
          addFullVideo: true,
        }),
      });

      const payload = await response.json().catch(() => undefined);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: string }).error
            : undefined;
        throw new Error(message ?? "Failed to add to clips");
      }

      updateAssets((a) =>
        a.id === assetId
          ? {
              ...a,
              clipCount: a.clipCount + 1,
            }
          : a
      );

      loadedTabsRef.current.delete("clips");

      setActionState((prev) => ({
        ...prev,
        [assetId]: {
          ...mergeWithDefaults(prev[assetId]),
          generating: false,
          message: "Added to Clips!",
        },
      }));

      setTimeout(() => {
        setActionState((prev) => {
          const next = { ...prev };
          delete next[assetId];
          return next;
        });
      }, 2200);
    } catch (err) {
      console.error("Failed to add to clips:", err);
      setActionState((prev) => ({
        ...prev,
        [assetId]: {
          ...mergeWithDefaults(prev[assetId]),
          generating: false,
          message:
            err instanceof Error
              ? err.message
              : "Failed to add to clips. Please retry.",
        },
      }));
    }
  };

  const removeAsset = useCallback((assetId: string) => {
    setTabData((prev) => ({
      ...prev,
      all: prev.all.filter((asset) => asset.id !== assetId),
      videos: prev.videos.filter((asset) => asset.id !== assetId),
      links: prev.links.filter((asset) => asset.id !== assetId),
      clips: prev.clips.filter((clip) => clip.mediaAssetId !== assetId),
    }));
  }, []);

  const handleGenerateClips = async (assetId: string) => {
    // Redirect to studio page for clip generation
    window.location.href = '/studio';
  };

  const handleDelete = async (
    assetId: string,
    options?: { skipConfirm?: boolean }
  ) => {
    if (!options?.skipConfirm) {
      const confirmed = window.confirm(
        "This will remove the uploaded item. Continue?"
      );
      if (!confirmed) return;
    }

    setActionState((prev) => ({
      ...prev,
      [assetId]: {
        ...mergeWithDefaults(prev[assetId]),
        deleting: true,
        message: undefined,
      },
    }));

    try {
      const response = await fetch(`/api/media/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: string }).error
            : undefined;
        throw new Error(message ?? "Failed to delete media asset");
      }

      removeAsset(assetId);
      setSelectedIds((prev) => {
        if (!prev.has(assetId)) return prev;
        const next = new Set(prev);
        next.delete(assetId);
        return next;
      });
      setActionState((prev) => {
        const next = { ...prev };
        delete next[assetId];
        return next;
      });
    } catch (err) {
      console.error("Failed to delete media asset:", err);
      setActionState((prev) => ({
        ...prev,
        [assetId]: {
          ...mergeWithDefaults(prev[assetId]),
          deleting: false,
          message:
            err instanceof Error
              ? err.message
              : "Delete failed. Try again.",
        },
      }));
    }
  };

  const handleRenameAsset = useCallback(
    async (asset: MediaAsset) => {
      const currentName =
        getFriendlyName(asset) ??
        asset.originalFilename ??
        asset.title ??
        "Untitled";
      const proposed = window.prompt(
        "Rename video",
        currentName ?? "Untitled"
      );
      if (proposed === null) return;
      const trimmed = proposed.trim();
      if (!trimmed || trimmed === currentName) {
        return;
      }

      setActionState((prev) => ({
        ...prev,
        [asset.id]: {
          ...mergeWithDefaults(prev[asset.id]),
          renaming: true,
          message: "Renaming...",
        },
      }));

      try {
        const response = await fetch("/api/media-assets", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: asset.id, name: trimmed }),
        });
        const payload = await response.json().catch(() => undefined);

        if (!response.ok) {
          const message =
            payload && typeof payload === "object" && "error" in payload
              ? (payload as { error?: string }).error
              : undefined;
          throw new Error(message ?? "Failed to rename video.");
        }

        setTabData((prev) => {
          const renameAsset = (item: MediaAsset) =>
            item.id === asset.id
              ? {
                  ...item,
                  title: trimmed,
                  originalFilename: trimmed,
                }
              : item;

          return {
            ...prev,
            all: prev.all.map(renameAsset),
            videos: prev.videos.map(renameAsset),
            links: prev.links.map(renameAsset),
            clips: prev.clips.map((clip) =>
              clip.mediaAssetId === asset.id
                ? { ...clip, assetFileName: trimmed }
                : clip
            ),
          };
        });

        setActionState((prev) => ({
          ...prev,
          [asset.id]: {
            ...mergeWithDefaults(prev[asset.id]),
            renaming: false,
            message: "Renamed!",
          },
        }));

        setTimeout(() => {
          setActionState((prev) => {
            const next = { ...prev };
            delete next[asset.id];
            return next;
          });
        }, 1800);
      } catch (error) {
        console.error("Failed to rename media asset:", error);
        setActionState((prev) => ({
          ...prev,
          [asset.id]: {
            ...mergeWithDefaults(prev[asset.id]),
            renaming: false,
            message:
              error instanceof Error
                ? error.message
                : "Rename failed. Try again.",
          },
        }));
      }
    },
    [setTabData, setActionState]
  );

  const handleRenameClip = useCallback(async (clip: ClipItem) => {
    const actionKey = `clip-${clip.id}`;
    const currentName =
      clip.title ?? clip.assetFileName ?? `Clip ${clip.id.slice(0, 6)}`;
    const proposed = window.prompt("Rename clip", currentName);
    if (proposed === null) return;
    const trimmed = proposed.trim();
    if (!trimmed || trimmed === currentName) {
      return;
    }

    setActionState((prev) => ({
      ...prev,
      [actionKey]: {
        ...mergeWithDefaults(prev[actionKey]),
        renaming: true,
        message: "Renaming...",
      },
    }));

    try {
      const response = await fetch("/api/clip", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: clip.id, title: trimmed }),
      });
      const payload = await response.json().catch(() => undefined);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: string }).error
            : undefined;
        throw new Error(message ?? "Failed to rename clip.");
      }

      setTabData((prev) => ({
        ...prev,
        clips: prev.clips.map((item) =>
          item.id === clip.id ? { ...item, title: trimmed } : item
        ),
      }));

      setActionState((prev) => ({
        ...prev,
        [actionKey]: {
          ...mergeWithDefaults(prev[actionKey]),
          renaming: false,
          message: "Renamed!",
        },
      }));

      setTimeout(() => {
        setActionState((prev) => {
          const next = { ...prev };
          delete next[actionKey];
          return next;
        });
      }, 1800);
    } catch (error) {
      console.error("Failed to rename clip:", error);
      setActionState((prev) => ({
        ...prev,
        [actionKey]: {
          ...mergeWithDefaults(prev[actionKey]),
          renaming: false,
          message:
            error instanceof Error
              ? error.message
              : "Rename failed. Try again.",
        },
      }));
    }
  }, [setTabData, setActionState]);

  const handleDeleteClip = async (clip: ClipItem) => {
    const actionKey = `clip-${clip.id}`;
    setActionState((prev) => ({
      ...prev,
      [actionKey]: {
        ...mergeWithDefaults(prev[actionKey]),
        deleting: true,
        message: undefined,
      },
    }));

    try {
      const response = await fetch(`/api/clip?id=${clip.id}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => undefined);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: string }).error
            : undefined;
        throw new Error(message ?? "Failed to delete clip");
      }

      setTabData((prev) => {
        const adjust = (assets: MediaAsset[]) =>
          assets.map((asset) =>
            asset.id === clip.mediaAssetId
              ? {
                  ...asset,
                  clipCount: Math.max(0, asset.clipCount - 1),
                }
              : asset
          );
        return {
          ...prev,
          clips: prev.clips.filter((item) => item.id !== clip.id),
          all: adjust(prev.all),
          videos: adjust(prev.videos),
          links: adjust(prev.links),
        };
      });

      setActionState((prev) => ({
        ...prev,
        [actionKey]: {
          ...mergeWithDefaults(prev[actionKey]),
          generating: false,
          deleting: false,
          message: "Clip deleted",
        },
      }));

      setTimeout(() => {
        setActionState((prev) => {
          const next = { ...prev };
          delete next[actionKey];
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to delete clip:", err);
      setActionState((prev) => ({
        ...prev,
        [actionKey]: {
          ...mergeWithDefaults(prev[actionKey]),
          deleting: false,
          message:
            err instanceof Error
              ? err.message
              : "Delete failed. Try again.",
        },
      }));
    }
  };

  const handleViewStats = (asset: MediaAsset) => {
    setStatsPanel({
      isOpen: true,
      type: 'video',
      data: {
        id: asset.id,
        fileName: getFriendlyName(asset),
        duration: asset.durationS,
        fileSize: asset.fileSize,
        format: 'MP4 1080p',
        uploadedAt: asset.createdAt,
        clipCount: asset.clipCount ?? 0,
        status: asset.status,
      },
    });
  };

  const handleViewClipStats = (clip: ClipItem) => {
    // Mock data for now - replace with actual API call later
    setStatsPanel({
      isOpen: true,
      type: 'clip',
      data: {
        id: clip.id,
        title: clip.title || clip.assetFileName || `Clip #${clip.id}`,
        views: 125340,
        likes: 8421,
        shares: 1234,
        comments: 567,
        avgWatchTime: 23,
        score: 87,
        platforms: [
          { name: 'TikTok', views: 89200, isBest: true },
          { name: 'YouTube', views: 24100, isBest: false },
          { name: 'Instagram', views: 12040, isBest: false },
        ],
        campaignCount: 3,
      },
    });
  };

  const closeStatsPanel = () => {
    setStatsPanel({
      isOpen: false,
      type: 'video',
      data: null,
    });
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    loadedTabsRef.current.delete(activeTab);
    try {
      await loadTabData(activeTab);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, loadTabData]);

  const handleFilterChipToggle = useCallback((chipId: string) => {
    setActiveFilterChips((prev) => {
      const next = new Set(prev);

      if (chipId === "all-platforms") {
        if (next.has("all-platforms")) {
          next.delete("all-platforms");
        } else {
          next.clear();
          next.add("all-platforms");
        }
        if (next.size === 0) {
          next.add("all-platforms");
        }
        return next;
      }

      next.delete("all-platforms");

      if (next.has(chipId)) {
        next.delete(chipId);
      } else {
        next.add(chipId);
      }

      if (next.size === 0) {
        next.add("all-platforms");
      }

      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilterChips(new Set(["all-platforms"]));
    setSearchTerm("");
  }, []);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode((current) => (current === mode ? current : mode));
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const performBulkAction = async (mode: "generate" | "add" | "delete") => {
    if (mode === "generate" && selectedAssetIds.length === 0) {
      return;
    }
    if (mode === "add" && selectedAssetIds.length === 0) {
      return;
    }
    if (
      mode === "delete" &&
      selectedAssetIds.length === 0 &&
      selectedClipObjects.length === 0
    ) {
      return;
    }

    if (mode === "delete") {
      const confirmMessage = `Delete ${selectedAssetIds.length} video${
        selectedAssetIds.length === 1 ? "" : "s"
      } and ${selectedClipObjects.length} clip${
        selectedClipObjects.length === 1 ? "" : "s"
      }?`;
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }

    setBulkAction(mode);
    try {
      if (mode === "generate") {
        for (const id of selectedAssetIds) {
          await handleGenerateClips(id);
        }
        } else if (mode === "add") {
        for (const id of selectedAssetIds) {
          await handleAddToClips(id);
        }
      } else if (mode === "delete") {
        for (const id of selectedAssetIds) {
          await handleDelete(id, { skipConfirm: true });
        }
        for (const clipItem of selectedClipObjects) {
          await handleDeleteClip(clipItem);
        }
      }
      clearSelection();
    } finally {
      setBulkAction(null);
    }
  };

  // Premium Video Card Component
  const renderVideoCard = (asset: MediaAsset, index: number) => {
    const actionSnapshot = actionState[asset.id];
    const actions = mergeWithDefaults(actionSnapshot);
    const actionMessage = actionSnapshot?.message;
    const friendlyName = getFriendlyName(asset);
    const clipLabel = pluralizeClips(asset.clipCount);
    const statusMeta = getStatusMeta(asset.status);
    const platformDetails = getPlatformDetails(asset.sourceUrl ?? asset.url);
    const PlatformIcon = platformDetails.icon;
    const isSelected = selectedIds.has(asset.id);
    const contextKey = `asset-${asset.id}`;

    return (
      <article
        key={asset.id}
        className={clsx(
          "group relative overflow-hidden rounded-3xl border bg-white/[0.05] text-white transition-all duration-300 backdrop-blur-md",
          isGridView
            ? "flex flex-col"
            : "flex flex-col md:flex-row md:items-stretch",
          isSelected
            ? "border-cyan-400/60 shadow-[0_40px_90px_-45px_rgba(56,189,248,0.7)] ring-2 ring-cyan-400/40"
            : "border-white/10 shadow-[0_30px_85px_-50px_rgba(0,0,0,0.85)] hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_45px_120px_-60px_rgba(56,189,248,0.65)]"
        )}
        style={{
          animation: `fadeSlideUp 0.45s ease-out ${index * 0.05}s both`,
        }}
      >
        <div
          className={clsx(
            "relative overflow-hidden",
            isGridView
              ? "aspect-video w-full"
              : "aspect-video w-full md:w-72 md:flex-shrink-0"
          )}
        >
          {asset.thumbnail ? (
            <Image
              fill
              src={asset.thumbnail}
              alt={friendlyName ?? "Video thumbnail"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : asset.url ? (
            <video
              src={asset.url}
              preload="metadata"
              muted
              playsInline
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onLoadedMetadata={(e) => {
                // Seek to 1 second to show a frame (not black screen)
                const video = e.currentTarget;
                video.currentTime = Math.min(1, video.duration * 0.1);
              }}
              onError={(e) => {
                console.error('Video load error for asset:', asset.id, asset.url);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cyan-900/40 to-blue-900/40">
              <Video className="w-16 h-16 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-70" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVideoPlayer({
                isOpen: true,
                url: asset.url,
                title: friendlyName || "Video",
                duration: asset.durationS ?? undefined,
              });
            }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            style={{ zIndex: 5 }}
            aria-label="Play video"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white opacity-0 shadow-[0_20px_45px_-25px_rgba(56,189,248,0.6)] backdrop-blur-lg transition-all duration-300 group-hover:scale-105 group-hover:opacity-100">
              <Play className="h-8 w-8" />
            </div>
          </button>
          {asset.durationS && (
            <div className="absolute right-4 bottom-4">
              <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
                {formatDuration(asset.durationS)}
              </span>
            </div>
          )}
        <div className="absolute left-4 top-4 z-30 flex flex-col items-start gap-2">
          <span
            className={clsx(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur",
              statusMeta.badgeClass
            )}
            >
              <statusMeta.Icon
                className={clsx("h-3.5 w-3.5", statusMeta.iconClass)}
              />
              {statusMeta.label}
            </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleToggleSelect(asset.id);
            }}
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-all duration-200 backdrop-blur",
              isSelected
                ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-200"
                : "opacity-0 group-hover:opacity-100 hover:border-cyan-400/60 hover:text-cyan-200"
            )}
          >
            {isSelected ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </button>
        </div>
          <div className="absolute right-4 top-4 z-30 flex flex-col items-end gap-2">
            <button
              type="button"
              data-context-menu-trigger
              onClick={(event) => {
                event.stopPropagation();
                setOpenContextId((prev) =>
                  prev === contextKey ? null : contextKey
                );
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white opacity-0 transition-all duration-200 hover:border-cyan-400/50 hover:text-cyan-200 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {openContextId === contextKey && (
              <div
                data-context-menu
                className="w-48 rounded-2xl border border-white/10 bg-black/85 p-2 text-left text-sm shadow-xl backdrop-blur"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={actions.renaming || actions.generating || actions.deleting}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenContextId(null);
                    void handleRenameAsset(asset);
                  }}
                >
                  <Pencil className="h-4 w-4 text-cyan-200" />
                  Rename
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={actions.generating || actions.deleting || actions.renaming}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenContextId(null);
                    void handleGenerateClips(asset.id);
                  }}
                >
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  Generate Clips
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={actions.generating || actions.deleting || actions.renaming}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenContextId(null);
                    handleAddToClips(asset.id);
                  }}
                  title="Creates a clip ready to edit or post"
                >
                  <Scissors className="h-4 w-4 text-emerald-200" />
                  Promote to Clip
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={actions.deleting || actions.renaming}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenContextId(null);
                    handleViewStats(asset);
                  }}
                >
                  <TrendingUp className="h-4 w-4 text-blue-200" />
                  View Stats
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={actions.deleting || actions.generating || actions.renaming}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenContextId(null);
                    void handleDelete(asset.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div
          className={clsx(
            "flex flex-1 flex-col justify-between gap-5 p-5",
            !isGridView && "md:p-6"
          )}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white sm:text-xl">
                {friendlyName}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                <Scissors className="h-3.5 w-3.5" />
                {clipLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
              <span>
                {new Date(asset.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-zinc-600 sm:inline-block" />
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-white/90">
                  <PlatformIcon
                    className={clsx("h-3.5 w-3.5", platformDetails.color)}
                  />
                  <span>{platformDetails.name}</span>
                </span>
                {asset.sourceUrl && (
                  <a
                    href={asset.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-cyan-200 transition hover:text-cyan-100"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </a>
                )}
              </div>
            </div>
          </div>
          {actionMessage && (
            <div className="rounded-2xl border border-cyan-400/40 bg-cyan-400/15 px-4 py-2 text-xs text-cyan-100">
              {actionMessage}
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-black/75 px-5 pb-5 pt-4 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-20">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleGenerateClips(asset.id);
                }}
                disabled={actions.generating || actions.deleting || actions.renaming}
                className={clsx(
                  "pointer-events-auto inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 px-3 py-2 text-sm font-semibold text-black transition duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-1 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60",
                  "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-75"
                )}
              >
                {actions.generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>
                  {actions.generating ? "Generating..." : "Generate Clips"}
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewStats(asset);
                }}
                disabled={actions.deleting || actions.renaming}
                className={clsx(
                  "pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-200/40 focus:ring-offset-1 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60",
                  "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-100"
                )}
              >
                <TrendingUp className="h-4 w-4" />
                <span>View Stats</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleAddToClips(asset.id);
                }}
                disabled={actions.generating || actions.deleting || actions.renaming}
                title="Creates a clip ready to edit or post"
                className={clsx(
                  "pointer-events-auto inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 focus:ring-offset-1 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60",
                  "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-150"
                )}
              >
                <Scissors className="h-4 w-4" />
                <span>Promote to Clip</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDelete(asset.id);
                }}
                disabled={actions.deleting || actions.generating || actions.renaming}
                className={clsx(
                  "pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-300/40 focus:ring-offset-1 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60",
                  "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-200"
                )}
              >
                {actions.deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>{actions.deleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const renderLinkCard = (asset: MediaAsset, index: number) => {
    const actionSnapshot = actionState[asset.id];
    const actions = mergeWithDefaults(actionSnapshot);
    const actionMessage = actionSnapshot?.message;
    const friendlyName = getFriendlyName(asset);
    const platform = getPlatformDetails(asset.sourceUrl ?? asset.url);
    const PlatformIcon = platform.icon;
    const clipLabel = pluralizeClips(asset.clipCount);
    const statusMeta = getStatusMeta(asset.status);
    const isSelected = selectedIds.has(asset.id);
    const contextKey = `link-${asset.id}`;

    return (
      <article
        key={asset.id}
        className={clsx(
          "group relative overflow-hidden rounded-3xl border bg-white/[0.04] p-5 text-white transition-all duration-300 backdrop-blur",
          isSelected
            ? "border-cyan-400/60 shadow-[0_35px_90px_-45px_rgba(56,189,248,0.6)] ring-2 ring-cyan-400/40"
            : "border-white/10 shadow-[0_30px_80px_-55px_rgba(0,0,0,0.85)] hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_40px_110px_-60px_rgba(56,189,248,0.55)]"
        )}
        style={{
          animation: `fadeSlideUp 0.45s ease-out ${index * 0.05}s both`,
        }}
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.05] via-transparent to-transparent opacity-90" />
        <div className="absolute left-4 top-4 z-20 flex flex-row items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleToggleSelect(asset.id);
            }}
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-all duration-200 backdrop-blur",
              isSelected
                ? "border-cyan-400/80 bg-cyan-500/20 text-cyan-200"
                : "opacity-0 group-hover:opacity-100 hover:border-cyan-400/60 hover:text-cyan-200"
            )}
          >
            {isSelected ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.12] text-white shadow-[0_18px_38px_-25px_rgba(56,189,248,0.5)]">
              <PlatformIcon className={clsx("h-7 w-7", platform.color)} />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-white sm:text-xl">
                  {friendlyName}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                  <Scissors className="h-3.5 w-3.5" />
                  {clipLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
                <span>{platform.name}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span>
                  {new Date(asset.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        {actionMessage && (
          <div className="relative z-10 mt-4 rounded-2xl border border-cyan-400/40 bg-cyan-400/15 px-4 py-2 text-xs text-cyan-100">
            {actionMessage}
          </div>
        )}
        <div className="absolute inset-x-4 bottom-4 z-30 opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none">
          <div className="flex flex-wrap gap-2 justify-end items-center relative">
            <div className="relative pointer-events-auto">
              <button
                type="button"
                data-context-menu-trigger
                onClick={(event) => {
                  event.stopPropagation();
                  console.log('Menu button clicked for:', contextKey);
                  setOpenContextId((prev) =>
                    prev === contextKey ? null : contextKey
                  );
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition-all duration-200 hover:border-cyan-400/50 hover:text-cyan-200 backdrop-blur"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {openContextId === contextKey && (
                <div
                  data-context-menu
                  className="absolute left-0 bottom-full mb-2 w-40 rounded-2xl border border-white/10 bg-black/95 p-2 text-left text-sm shadow-2xl backdrop-blur-md"
                  style={{ zIndex: 100 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={actions.renaming || actions.generating || actions.deleting}
                    onClick={(event) => {
                      event.stopPropagation();
                      console.log('Rename clicked for:', asset.id);
                      setOpenContextId(null);
                      void handleRenameAsset(asset);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-cyan-200" />
                    Rename
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  asset.sourceUrl ?? asset.url,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white transition duration-200 hover:border-cyan-300/50 hover:text-cyan-100"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Link</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewStats(asset);
              }}
              disabled={actions.deleting || actions.renaming}
              className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white transition duration-200 hover:border-cyan-300/50 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <TrendingUp className="h-4 w-4" />
              <span>View Stats</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/studio';
              }}
              disabled={actions.generating || actions.deleting || actions.renaming}
              className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 px-3 py-2 text-sm font-semibold text-black transition duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Clips</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleDelete(asset.id);
              }}
              disabled={actions.deleting || actions.generating || actions.renaming}
              className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200 transition duration-200 hover:border-red-300/50 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actions.deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>{actions.deleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>
        </div>
      </article>
    );
  };

  // Premium Clip Card Component (Purple Accent)
  const renderClipCard = (clip: ClipItem, index: number) => {
    const actionKey = `clip-${clip.id}`;
    const actionSnapshot = actionState[actionKey];
    const actions = mergeWithDefaults(actionSnapshot);
    const actionMessage = actionSnapshot?.message;
    const friendlyTitle =
      clip.title ?? clip.assetFileName ?? `Clip ${clip.id.slice(0, 6)}`;
    const statusMeta = getStatusMeta(clip.status);
    const selectionKey = actionKey;
    const isSelected = selectedIds.has(selectionKey);
    const contextKey = actionKey;

    return (
      <article
        key={clip.id}
        className={clsx(
          "group relative overflow-hidden rounded-3xl border bg-white/[0.05] text-white transition-all duration-300 backdrop-blur-md",
          isGridView
            ? "flex flex-col"
            : "flex flex-col md:flex-row md:items-stretch",
          isSelected
            ? "border-purple-400/70 shadow-[0_40px_95px_-50px_rgba(168,85,247,0.6)] ring-2 ring-purple-400/40"
            : "border-purple-500/20 shadow-[0_30px_85px_-55px_rgba(76,29,149,0.75)] hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-[0_45px_120px_-65px_rgba(168,85,247,0.6)]"
        )}
        style={{
          animation: `fadeSlideUp 0.45s ease-out ${index * 0.05}s both`,
        }}
      >
        <div
          className={clsx(
            "relative overflow-hidden",
            isGridView
              ? "aspect-video w-full"
              : "aspect-video w-full md:w-64 md:flex-shrink-0"
          )}
        >
          {clip.thumbnail ? (
            <Image
              fill
              src={clip.thumbnail}
              alt={friendlyTitle}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : clip.clipUrl ? (
            <video
              src={clip.clipUrl}
              preload="metadata"
              muted
              playsInline
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onLoadedMetadata={(e) => {
                // Seek to 1 second to show a frame (not black screen)
                const video = e.currentTarget;
                video.currentTime = Math.min(1, video.duration * 0.1);
              }}
              onError={(e) => {
                console.error('Video load error for clip:', clip.id, clip.clipUrl);
                // Fallback: hide video on error
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40">
              <Video className="w-16 h-16 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-70" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVideoPlayer({
                isOpen: true,
                url: clip.clipUrl,
                title: friendlyTitle,
                duration: clip.duration ?? undefined,
              });
            }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            style={{ zIndex: 5 }}
            aria-label="Play clip"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white opacity-0 shadow-[0_20px_45px_-25px_rgba(168,85,247,0.6)] backdrop-blur-lg transition-all duration-300 group-hover:scale-105 group-hover:opacity-100">
              <Play className="h-7 w-7" />
            </div>
          </button>
          <div className="absolute left-4 top-4 z-30 flex flex-col items-start gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-300/40 bg-purple-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-100 backdrop-blur">
              <Video className="h-3.5 w-3.5" />
              Clip
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleToggleSelect(selectionKey);
              }}
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition-all duration-200 backdrop-blur",
                isSelected
                  ? "border-purple-300/80 bg-purple-500/20 text-purple-100"
                  : "opacity-0 group-hover:opacity-100 hover:border-purple-300/60 hover:text-purple-100"
              )}
            >
              {isSelected ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="absolute right-4 top-4 z-30 flex flex-col items-end gap-2">
            <button
              type="button"
              data-context-menu-trigger
              onClick={(event) => {
                event.stopPropagation();
                setOpenContextId((prev) =>
                  prev === contextKey ? null : contextKey
                );
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 transition-all duration-200 hover:border-purple-300/60 hover:text-purple-100 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {openContextId === contextKey && (
              <div
                data-context-menu
                className="w-48 rounded-2xl border border-white/10 bg-black/85 p-2 text-left text-sm shadow-xl backdrop-blur"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={actions.renaming || actions.deleting || actions.generating}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenContextId(null);
                    void handleRenameClip(clip);
                  }}
                >
                  <Pencil className="h-4 w-4 text-purple-200" />
                  Rename Clip
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={actions.renaming}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenContextId(null);
                  setVideoPlayer({
                    isOpen: true,
                    url: clip.clipUrl,
                    title: friendlyTitle,
                    duration: clip.duration ?? undefined,
                  });
                  }}
                >
                  <Play className="h-4 w-4 text-purple-200" />
                  Open Clip
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={actions.deleting || actions.generating || actions.renaming}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenContextId(null);
                    void handleDeleteClip(clip);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Clip
                </button>
              </div>
            )}
          </div>
        </div>
        <div
          className={clsx(
            "flex flex-1 flex-col justify-between gap-5 p-5",
            !isGridView && "md:p-6"
          )}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white sm:text-xl">
                {friendlyTitle}
              </h3>
              <span
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur",
                  statusMeta.badgeClass
                )}
              >
                <statusMeta.Icon
                  className={clsx("h-3.5 w-3.5", statusMeta.iconClass)}
                />
                {statusMeta.label}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {new Date(clip.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          {actionMessage && (
            <div className="rounded-2xl border border-purple-400/40 bg-purple-500/15 px-4 py-2 text-xs text-purple-100">
              {actionMessage}
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-black/75 px-5 pb-5 pt-4 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewClipStats(clip);
              }}
              className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white transition duration-200 hover:border-cyan-300/50 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200/40 focus:ring-offset-1 focus:ring-offset-black"
            >
              <TrendingUp className="h-4 w-4" />
              <span>View Stats</span>
            </button>
            <button
              type="button"
              className="pointer-events-auto inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 px-3 py-2 text-sm font-semibold text-black transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300/40 focus:ring-offset-1 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actions.deleting || actions.renaming}
            >
              <Upload className="h-4 w-4" />
              <span>Post Now</span>
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteClip(clip)}
              disabled={actions.deleting || actions.renaming}
              className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-300/40 focus:ring-offset-1 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actions.deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>{actions.deleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>
        </div>
      </article>
    );
  };

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="text-center">
          <p className="mb-4 text-zinc-300">{error}</p>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            onClick={handleRefresh}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const hasContent =
    activeTab === "clips"
      ? sortedClips.length > 0
      : activeTab === "all"
      ? allTabItems.length > 0
      : sortedAssets.length > 0;

  const emptyStateConfig = {
    all: {
      icon: Upload,
      title: "Build your library",
      description:
        "Upload videos or import links to start generating premium, share-ready clips.",
      primaryAction: { label: "Upload Video", icon: Upload, tab: "file" as const },
      secondaryAction: { label: "Import Link", icon: LinkIcon, tab: "url" as const },
    },
    videos: {
      icon: Upload,
      title: "Your stage is empty",
      description:
        "Upload your first video to unlock clip automations and insights.",
      primaryAction: { label: "Upload Video", icon: Upload, tab: "file" as const },
    },
    links: {
      icon: LinkIcon,
      title: "Bring content from anywhere",
      description:
        "Import YouTube, Spotify, TikTok, Vimeo, and more to enrich your library.",
      primaryAction: { label: "Import Link", icon: LinkIcon, tab: "url" as const },
    },
    clips: {
      icon: Scissors,
      title: "Generate your first highlight",
      description:
        "Turn long-form videos into scroll-stopping clips in seconds.",
      primaryAction: { label: "Upload Video", icon: Upload, tab: "file" as const },
    },
  }[activeTab];

  const EmptyIcon = emptyStateConfig.icon;
  const PrimaryActionIcon = emptyStateConfig.primaryAction.icon;
  const SecondaryActionIcon =
    emptyStateConfig.secondaryAction?.icon ?? null;

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-950 to-black text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <header className="mb-10 space-y-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Premium Library
              </span>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <h1 className="text-3xl font-semibold sm:text-4xl md:text-5xl">
                  <span className="bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                    Content Library
                  </span>
                </h1>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  {tabCounts[activeTab]}{" "}
                  {tabCounts[activeTab] === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
                Manage your media, monitor publishing status, and orchestrate clip generation with a premium dashboard experience.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => open({ tab: "file" })}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_20px_60px_-25px_rgba(56,189,248,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-30px_rgba(99,102,241,0.6)] active:scale-[0.97]"
              >
                <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                <Upload className="h-4 w-4" />
                <span>Upload Video</span>
              </button>
              <button
                type="button"
                onClick={() => open({ tab: "url" })}
                className="group inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-white/[0.08] active:scale-[0.97]"
              >
                <LinkIcon className="h-4 w-4 text-cyan-200" />
                <span>Import Link</span>
              </button>
              <button
                type="button"
                onClick={() => void handleRefresh()}
                className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08] active:scale-[0.97]"
              >
                <RefreshCcw
                  className={clsx(
                    "h-4 w-4 transition-transform duration-500",
                    refreshing ? "animate-spin" : "group-hover:rotate-180"
                  )}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 xl:flex-1">
              <div className="relative flex-1 max-w-2xl">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search your content..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.08] py-4 pl-14 pr-14 text-base text-white placeholder:text-zinc-500 outline-none transition focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/40 focus:bg-white/[0.12]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.12] text-zinc-300 transition hover:bg-white/[0.18] hover:text-white"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5">
                  <Filter className="h-4 w-4 text-cyan-200" />
                  <select
                    value={Array.from(activeFilterChips)[0] || "all-platforms"}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === "all-platforms") {
                        setActiveFilterChips(new Set(["all-platforms"]));
                      } else {
                        setActiveFilterChips(new Set([value]));
                      }
                    }}
                    className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer min-w-[140px]"
                  >
                    {FILTER_CHIPS.map((chip) => (
                      <option
                        key={chip.id}
                        value={chip.id}
                        className="bg-zinc-900 text-white"
                      >
                        {chip.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
                <ArrowUpDown className="h-4 w-4 text-cyan-200" />
                <select
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(event.target.value as SortOption)
                  }
                  className="bg-transparent text-sm font-medium text-white outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option
                      key={option.id}
                      value={option.id}
                      className="bg-zinc-900 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.05] p-1">
                {(["grid", "list"] as const).map((mode) => {
                  const isActiveMode = viewMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleViewModeChange(mode)}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActiveMode
                          ? "bg-gradient-to-r from-cyan-400/90 via-sky-400/70 to-purple-500/80 text-black shadow-[0_12px_24px_-18px_rgba(56,189,248,0.65)]"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      {mode === "grid" ? (
                        <LayoutGrid className="h-4 w-4" />
                      ) : (
                        <ListIcon className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">
                        {mode === "grid" ? "Grid" : "List"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <section className="mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-1 backdrop-blur">
            <div
              className="pointer-events-none absolute bottom-1 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 transition-transform duration-500 ease-out"
              style={{
                width: `calc(100% / ${TABS.length})`,
                transform: `translateX(${Math.max(activeTabIndex, 0) * 100}%)`,
              }}
            />
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
              {TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                const count = tabCounts[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "flex flex-col items-start rounded-xl px-4 py-3 text-left transition-all duration-200",
                      isActive
                        ? "bg-white/[0.12] text-white shadow-[0_20px_45px_-25px_rgba(56,189,248,0.6)]"
                        : "text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {tab.label}
                      <span
                        className={clsx(
                          "rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                          isActive
                            ? "bg-gradient-to-r from-cyan-400/80 to-purple-500/70 text-black"
                            : "bg-white/[0.08] text-zinc-400"
                        )}
                      >
                        {count}
                      </span>
                    </span>
                    <span className="mt-1 text-xs text-zinc-500">
                      {TAB_DESCRIPTIONS[tab.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {loading ? (
          <section
            className={clsx(
              "gap-6",
              isGridView
                ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "flex flex-col"
            )}
          >
            {Array.from({ length: isGridView ? 8 : 6 }).map((_, index) => (
              <article
                key={index}
                className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5"
              >
                <div className="mb-4 h-40 w-full rounded-xl skeleton-shimmer" />
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded-full bg-white/[0.12]" />
                  <div className="h-3 w-1/2 rounded-full bg-white/[0.08]" />
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-1/3 rounded-full bg-white/[0.06]" />
                    <div className="h-3 w-1/4 rounded-full bg-white/[0.04]" />
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : !hasContent ? (
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] px-6 py-16 text-center">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]" />
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] shadow-[0_25px_60px_-30px_rgba(56,189,248,0.45)]">
                <EmptyIcon className="h-10 w-10 text-cyan-300" />
              </div>
              <h2 className="text-3xl font-semibold">
                <span className="bg-gradient-to-r from-cyan-200 via-white to-purple-300 bg-clip-text text-transparent">
                  {emptyStateConfig.title}
                </span>
              </h2>
              <p className="text-sm text-zinc-400 sm:text-base">
                {emptyStateConfig.description}
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => open({ tab: emptyStateConfig.primaryAction.tab })}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 px-6 py-3 text-sm font-semibold text-black shadow-[0_25px_60px_-30px_rgba(56,189,248,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-30px_rgba(99,102,241,0.6)] active:scale-[0.97]"
                >
                  <PrimaryActionIcon className="h-4 w-4" />
                  <span>{emptyStateConfig.primaryAction.label}</span>
                </button>
                {emptyStateConfig.secondaryAction && SecondaryActionIcon && (
                  <button
                    type="button"
                    onClick={() =>
                      open({ tab: emptyStateConfig.secondaryAction.tab })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08] active:scale-[0.97]"
                  >
                    <SecondaryActionIcon className="h-4 w-4" />
                    <span>{emptyStateConfig.secondaryAction.label}</span>
                  </button>
                )}
              </div>
              <div className="mx-auto mt-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left shadow-[0_30px_80px_-40px_rgba(56,189,248,0.45)]">
                <div className="h-40 w-full rounded-xl bg-gradient-to-br from-cyan-400/20 via-purple-500/15 to-transparent" />
                <div className="mt-4 space-y-3">
                  <div className="h-3.5 w-3/4 rounded-full bg-white/[0.12]" />
                  <div className="h-3 w-2/3 rounded-full bg-white/[0.08]" />
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400/40 to-purple-500/30" />
                    <div className="h-3 w-1/2 rounded-full bg-white/[0.08]" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {activeTab === "clips" ? (
              <section
                className={clsx(
                  "grid gap-6",
                  isGridView
                    ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}
              >
                {sortedClips.map((clip, index) => renderClipCard(clip, index))}
              </section>
            ) : activeTab === "links" ? (
              <section className="flex flex-col gap-4">
                {sortedAssets.map((asset, index) => renderLinkCard(asset, index))}
              </section>
            ) : activeTab === "all" ? (
              <section
                className={clsx(
                  "grid gap-6",
                  isGridView
                    ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}
              >
                {allTabItems.map((item, index) =>
                  item.type === "clip"
                    ? renderClipCard(item.data as ClipItem, index)
                    : renderVideoCard(item.data as MediaAsset, index)
                )}
              </section>
            ) : (
              <section
                className={clsx(
                  "grid gap-6",
                  isGridView
                    ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}
              >
                {sortedAssets.map((asset, index) => renderVideoCard(asset, index))}
              </section>
            )}
          </>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-6">
          <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/15 bg-black/75 px-6 py-4 shadow-[0_25px_65px_-30px_rgba(56,189,248,0.6)] backdrop-blur-xl">
            <div>
              <p className="text-sm font-semibold text-white">
                {selectedCount} selected
              </p>
              <p className="text-xs text-zinc-400">
                {selectedAssetIds.length} video{selectedAssetIds.length === 1 ? "" : "s"} ·{" "}
                {selectedClipIds.length} clip{selectedClipIds.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void performBulkAction("generate")}
                disabled={!hasSelectedAssets || isBulkBusy}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60",
                  "border-cyan-400/50 bg-cyan-400/20 text-cyan-100 hover:bg-cyan-400/25"
                )}
              >
                {bulkAction === "generate" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate
              </button>
              <button
                type="button"
                onClick={() => void performBulkAction("add")}
                disabled={!hasSelectedAssets || isBulkBusy}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60",
                  "border-emerald-400/50 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/20"
                )}
              >
                {bulkAction === "add" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Scissors className="h-4 w-4" />
                )}
                Move to Clips
              </button>
              <button
                type="button"
                onClick={() => void performBulkAction("delete")}
                disabled={(!hasSelectedAssets && !hasSelectedClips) || isBulkBusy}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60",
                  "border-red-400/60 bg-red-500/20 text-red-200 hover:bg-red-500/30"
                )}
              >
                {bulkAction === "delete" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={isBulkBusy}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.12] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CloseIcon className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {videoPlayer.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={videoPlayer.title || "Video player"}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4 py-10 backdrop-blur-sm"
          onClick={closeVideoPlayer}
        >
          <div
            className="relative flex w-full max-w-5xl flex-col gap-4 rounded-3xl border border-white/15 bg-zinc-900/80 p-6 text-white shadow-2xl backdrop-blur-md"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="truncate text-lg font-semibold sm:text-xl">
                  {videoPlayer.title || "Video"}
                </h2>
                {videoPlayer.duration !== undefined && (
                  <span className="text-xs text-zinc-400">
                    Duration · {formatDuration(videoPlayer.duration)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeVideoPlayer}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:text-cyan-100"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex min-h-[200px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black">
              {videoPlayer.url ? (
                <video
                  key={videoPlayer.url}
                  src={videoPlayer.url}
                  controls
                  playsInline
                  autoPlay
                  className="max-h-[70vh] w-full rounded-2xl bg-black"
                >
                  <track kind="captions" />
                </video>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center text-sm text-zinc-300">
                  <AlertTriangle className="h-10 w-10 text-zinc-500" />
                  <p>We could not load this video. Try opening the original link instead.</p>
                </div>
              )}
            </div>
            {videoPlayer.url && (
              <a
                href={videoPlayer.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cyan-200 underline-offset-4 transition hover:text-cyan-100 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Open original file in new tab
              </a>
            )}
          </div>
        </div>
      )}

      {/* Stats Panel */}
      <StatsPanel
        isOpen={statsPanel.isOpen}
        onClose={closeStatsPanel}
        type={statsPanel.type}
        videoStats={statsPanel.type === 'video' ? statsPanel.data as any : undefined}
        clipStats={statsPanel.type === 'clip' ? statsPanel.data as any : undefined}
        onGenerateClips={() => {
          closeStatsPanel();
          window.location.href = '/studio';
        }}
      />

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.35);
          }
        }

        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0.04) 0%,
            rgba(255, 255, 255, 0.06) 35%,
            rgba(255, 255, 255, 0.02) 65%
          );
        }

        .skeleton-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 100%
          );
          animation: shimmer 1.8s infinite;
        }
      `}</style>

    </main>
  );
}
