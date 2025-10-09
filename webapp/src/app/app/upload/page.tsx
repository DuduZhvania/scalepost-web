"use client";
import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import "@uploadthing/react/styles.css";

export default function UploadPage() {
  const [urls, setUrls] = useState<string[]>([]);

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold mb-4">Upload a video</h1>

      <UploadButton
        endpoint="mediaUploader"
        onClientUploadComplete={(res) => {
          const newUrls = res?.map((f) => f.url) ?? [];
          setUrls((u) => [...newUrls, ...u]);
          alert("Upload complete!");
        }}
        onUploadError={(e) => alert(`Upload error: ${e.message}`)}
      />

      <div className="mt-6 space-y-3">
        {urls.map((u) => (
          <video key={u} src={u} controls className="w-full rounded" />
        ))}
      </div>
    </div>
  );
}


