"use client";

import { useEffect, useState } from "react";

type MediaAsset = {
  id: string;
  url: string;
  status: string;
  createdAt?: string | null;
  durationS?: number | null;
};

export default function LibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAssets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/media-assets");

        if (!response.ok) {
          throw new Error(`Failed to load media assets: ${response.statusText}`);
        }

        const data: MediaAsset[] = await response.json();

        if (isMounted) {
          setAssets(data);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-semibold">Media Library</h1>
        <p className="text-sm text-muted-foreground">
          Browse the media assets that have been uploaded to your workspace.
        </p>
      </header>

      {isLoading && <p>Loading media assets…</p>}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <section className="space-y-4">
          {assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No media assets found.</p>
          ) : (
            <ul className="space-y-3">
              {assets.map((asset) => (
                <li
                  key={asset.id}
                  className="rounded-lg border bg-background p-4 shadow-sm transition hover:shadow"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{asset.url}</span>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Status: {asset.status}
                    </span>
                    {asset.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        Uploaded on {new Date(asset.createdAt).toLocaleString()}
                      </span>
                    )}
                    {typeof asset.durationS === "number" && (
                      <span className="text-xs text-muted-foreground">
                        Duration: {asset.durationS}s
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
