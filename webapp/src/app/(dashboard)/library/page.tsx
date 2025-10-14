// src/app/library/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUploadModal } from "@/hooks/useUploadModal";

type MediaAsset = {
  id: string;
  url: string;
  status: string;
  createdAt: string;
  durationS?: number | null;
  userId?: string | null;
  title?: string | null;
  originalFilename?: string | null;
};

type ClipResponse = {
  id: string;
  mediaId: string;
  startS: number;
  endS: number;
  durationS: number;
  thumbnailUrl: string;
  status: string;
};

type ActionState = Record<
  string,
  { generating: boolean; deleting: boolean; message?: string }
>;

export default function LibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actionState, setActionState] = useState<ActionState>({});
  const { open } = useUploadModal();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchAssets = useCallback(async () => {
    try {
      setError(undefined);
      const response = await fetch("/api/media-assets", { cache: "no-store" });
      let data: MediaAsset[] = [];
      if (!response.ok) {
        const message = await response
          .json()
          .catch(() => ({ error: "Unable to load your media assets." }));
        throw new Error(message.error ?? "Unable to load your media assets.");
      } else {
        data = (await response.json()) as MediaAsset[];
      }
      setAssets(data);
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Failed to fetch media assets:", err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't load your videos. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    const handleUploaded = () => {
      setLoading(true);
      void fetchAssets();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("media:uploaded", handleUploaded);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("media:uploaded", handleUploaded);
      }
    };
  }, [fetchAssets]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      assets.forEach((asset) => {
        if (prev.has(asset.id)) {
          next.add(asset.id);
        }
      });
      return next;
    });
  }, [assets]);

  const selectedCount = selectedIds.size;
  const allSelected = selectedCount > 0 && selectedCount === assets.length;

  const toggleSelection = (assetId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSelectAll = () => {
    if (!assets.length) return;
    setSelectedIds((prev) => {
      if (prev.size === assets.length) {
        return new Set();
      }
      return new Set(assets.map((asset) => asset.id));
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedCount) return;
    const ids = Array.from(selectedIds);
    const confirmed = window.confirm(
      `Delete ${ids.length} selected video${ids.length > 1 ? "s" : ""}? This cannot be undone.`
    );
    if (!confirmed) return;

    setActionState((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = {
          ...(next[id] ?? { generating: false, deleting: false }),
          deleting: true,
          message: undefined,
        };
      });
      return next;
    });

    const outcomes = await Promise.all(
      ids.map(async (id) => {
        try {
          const response = await fetch(`/api/media/${id}`, { method: "DELETE" });
          if (!response.ok) {
            throw new Error(`Failed to delete asset ${id}`);
          }
          return { id, success: true as const };
        } catch (err) {
          console.error("Failed to delete media asset:", err);
          return { id, success: false as const };
        }
      })
    );

    const succeeded = new Set(
      outcomes.filter((outcome) => outcome.success).map((outcome) => outcome.id)
    );

    setAssets((prev) => prev.filter((asset) => !succeeded.has(asset.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      succeeded.forEach((id) => next.delete(id));
      return next;
    });
    setActionState((prev) => {
      const next = { ...prev };
      outcomes.forEach((outcome) => {
        if (outcome.success) {
          delete next[outcome.id];
        } else {
          next[outcome.id] = {
            ...(next[outcome.id] ?? { generating: false, deleting: false }),
            deleting: false,
            message: "Delete failed. Try again.",
          };
        }
      });
      return next;
    });

    if (succeeded.size > 0) {
      setLoading(true);
      void fetchAssets();
    }
  };

  const handleBulkGenerate = async () => {
    if (!selectedCount) return;
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await handleGenerateClips(id);
    }
    clearSelection();
  };

  const sortedAssets = useMemo(
    () =>
      assets.slice().sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [assets]
  );

  const handleGenerateClips = async (assetId: string) => {
    setActionState((prev) => ({
      ...prev,
      [assetId]: { ...prev[assetId], generating: true, message: undefined },
    }));

    try {
      const response = await fetch("/api/clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: assetId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate clip");
      }

      const clip = (await response.json()) as ClipResponse;
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === assetId ? { ...asset, status: "processed" } : asset
        )
      );

      setActionState((prev) => ({
        ...prev,
        [assetId]: {
          ...prev[assetId],
          generating: false,
          message: `Generated clip ${clip.id} (${clip.durationS}s)`,
        },
      }));
    } catch (err) {
      console.error("Clip generation failed:", err);
      setActionState((prev) => ({
        ...prev,
        [assetId]: {
          ...prev[assetId],
          generating: false,
          message: "Something went wrong. Please retry.",
        },
      }));
    }
  };

  const handleDelete = async (assetId: string) => {
    const confirmed = window.confirm(
      "This will remove the uploaded video. Continue?"
    );
    if (!confirmed) return;

    setActionState((prev) => ({
      ...prev,
      [assetId]: { ...prev[assetId], deleting: true, message: undefined },
    }));

    try {
      const response = await fetch(`/api/media/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete media asset");
      }

      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      setActionState((prev) => {
        const next = { ...prev };
        delete next[assetId];
        return next;
      });
      setSelectedIds((prev) => {
        if (!prev.has(assetId)) return prev;
        const next = new Set(prev);
        next.delete(assetId);
        return next;
      });
    } catch (err) {
      console.error("Failed to delete media asset:", err);
      setActionState((prev) => ({
        ...prev,
        [assetId]: {
          ...prev[assetId],
          deleting: false,
          message: "Delete failed. Try again.",
        },
      }));
    }
  };

  const handleViewStats = (asset: MediaAsset) => {
    const friendlyName = asset.url.split("/").pop();
    window.alert(
      `Stats dashboard coming soon.\n\nVideo: ${friendlyName ?? asset.id}`
    );
  };

  const statusClass = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40";
      case "posted":
        return "bg-blue-500/10 text-blue-300 border border-blue-500/40";
      default:
        return "bg-zinc-700/40 text-zinc-200 border border-zinc-600/50";
    }
  };

  const formatDuration = (seconds: number) => {
    const safeSeconds = Math.round(seconds);
    if (Number.isNaN(safeSeconds) || safeSeconds <= 0) return "—";
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  if (loading) {
    return (
      <main className="px-6 py-16 text-center text-zinc-400">Loading…</main>
    );
  }

  if (error) {
    return (
      <main className="px-6 py-16 text-center">
        <p className="text-zinc-300 mb-4">{error}</p>
        <button
          className="inline-flex items-center gap-2 rounded border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          onClick={() => {
            setLoading(true);
            void fetchAssets();
          }}
        >
          Retry
        </button>
      </main>
    );
  }

  if (!sortedAssets.length) {
    return (
      <main className="px-6 py-16 text-center text-zinc-400 flex flex-col items-center gap-4">
        <p>No uploads yet. Bring in your first video to get started.</p>
        <button
          className="inline-flex h-11 items-center justify-center rounded-lg bg-white/90 px-6 text-sm font-semibold text-black transition hover:bg-white"
          onClick={() => open({ tab: "file" })}
        >
          Upload Video
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-white">Content Library</h1>
          <p className="text-sm text-zinc-400">
            Review your source videos, generate clips, and monitor performance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-white/90 px-4 text-sm font-semibold text-black transition hover:bg-white"
            onClick={() => open({ tab: "file" })}
          >
            Upload Video
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
            onClick={() => {
              setLoading(true);
              void fetchAssets();
            }}
          >
            Refresh
          </button>
          {sortedAssets.length ? (
            <button
              className="inline-flex h-10 items-center justify-center rounded border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
              onClick={toggleSelectAll}
            >
              {allSelected ? "Clear Selection" : "Select All"}
            </button>
          ) : null}
        </div>
      </header>

      {selectedCount ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <div>
            <strong>{selectedCount}</strong> video
            {selectedCount > 1 ? "s are" : " is"} selected.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center justify-center rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
              onClick={handleBulkGenerate}
            >
              Generate clips
            </button>
            <button
              className="inline-flex items-center justify-center rounded-lg border border-red-500/60 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/30"
              onClick={handleBulkDelete}
            >
              Delete selected
            </button>
            <button
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800"
              onClick={clearSelection}
            >
              Clear
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {sortedAssets.map((asset) => {
          const friendlyName =
            asset.title ??
            asset.originalFilename ??
            asset.url.split("/").pop() ??
            asset.id;
          const actions = actionState[asset.id] ?? {
            generating: false,
            deleting: false,
          };
          const isSelected = selectedIds.has(asset.id);

          return (
            <article
              key={asset.id}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-zinc-950 shadow-lg shadow-black/40 transition ${
                isSelected
                  ? "border-emerald-500/60 ring-2 ring-emerald-500/30"
                  : "border-zinc-800"
              }`}
            >
              <div className="relative aspect-video w-full bg-zinc-900">
                <video
                  src={asset.url}
                  controls
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass(
                    asset.status
                  )}`}
                >
                  {asset.status}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="truncate text-base font-semibold text-white">
                      {friendlyName}
                    </h2>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-zinc-400">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-zinc-600 bg-zinc-900 text-emerald-400"
                      checked={isSelected}
                      onChange={() => toggleSelection(asset.id)}
                    />
                    Select
                  </label>
                </div>
                <div>
                  <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <div>
                      <dt className="uppercase tracking-wide text-zinc-600">
                        Uploaded
                      </dt>
                      <dd>
                        {new Date(asset.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </dd>
                    </div>
                    {asset.durationS != null ? (
                      <div>
                        <dt className="uppercase tracking-wide text-zinc-600">
                          Duration
                        </dt>
                        <dd>{formatDuration(asset.durationS)}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                {actions.message ? (
                  <p className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
                    {actions.message}
                  </p>
                ) : null}

                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-white/90 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/40"
                    onClick={() => handleGenerateClips(asset.id)}
                    disabled={actions.generating || actions.deleting}
                  >
                    {actions.generating ? "Generating…" : "Generate Clips"}
                  </button>
                  <button
                    className="inline-flex h-10 w-28 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handleViewStats(asset)}
                    disabled={actions.deleting}
                  >
                    View Stats
                  </button>
                  <button
                    className="inline-flex h-10 w-28 items-center justify-center rounded-lg border border-red-600/70 bg-red-600/10 text-sm font-medium text-red-400 transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handleDelete(asset.id)}
                    disabled={actions.deleting || actions.generating}
                  >
                    {actions.deleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
