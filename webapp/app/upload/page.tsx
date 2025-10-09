// src/app/app/upload/page.tsx
"use client";
import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
// type-only import is fine from a server file
import type { OurFileRouter } from "@/app/uploadthing/core";
import "@uploadthing/react/styles.css";

export default function UploadPage() {
  const [urls, setUrls] = useState<string[]>([]);

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold mb-4">Upload a video</h1>

      <UploadButton<OurFileRouter, "mediaUploader">
        endpoint="mediaUploader"
        onClientUploadComplete={(res: Array<{ url: string }>) => {
          const newUrls = res?.map((f: { url: string }) => f.url) ?? [];
          setUrls((u) => [...newUrls, ...u]);
          alert("Upload complete!");
        }}
        onUploadError={(e: Error) => alert(`Upload error: ${e.message}`)}
      />

      <div className="mt-6 space-y-3">
        {urls.map((u) => (
          <video key={u} src={u} controls className="w-full rounded" />
        ))}
      </div>
    </div>
  );
}
