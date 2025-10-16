import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createWriteStream } from "fs";
import { mkdir, unlink } from "fs/promises";
import { pipeline } from "stream/promises";
import { Readable, Transform } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { db } from "@/db";
import { media_assets } from "@/db/schema/media";

const MAX_FILE_SIZE_BYTES = 1073741824; // 1GB
const MIME_EXTENSION_MAP: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
};

export async function GET() {
  try {
    const assets = await db.select().from(media_assets);

    // Ensure dates and optional fields are normalized for the client.
    const transformedAssets = assets.map((asset) => ({
      id: asset.id,
      url: asset.fileUrl,
      status: asset.status,
      createdAt:
        asset.createdAt instanceof Date
          ? asset.createdAt.toISOString()
          : typeof asset.createdAt === "string"
            ? asset.createdAt
            : new Date().toISOString(),
      durationS: asset.duration ?? null,
      userId: asset.userId,
      title: asset.fileName,
      originalFilename: asset.fileName,
      fileName: asset.fileName,
      fileUrl: asset.fileUrl,
      fileSize: asset.fileSize ?? null,
      thumbnail: asset.thumbnail ?? null,
      metadata: asset.metadata ?? null,
    }));

    return NextResponse.json(transformedAssets);
  } catch (error) {
    console.error("❌ Failed to fetch media assets:", error);
    return NextResponse.json(
      { error: "Failed to load assets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let filePath: string | undefined;
  const cleanupPartialFile = async () => {
    if (!filePath) return;
    try {
      await unlink(filePath);
    } catch {
      // Best-effort clean-up
    }
  };

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const response = await fetch(parsedUrl, { signal: controller.signal });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Unable to fetch video. Received status ${response.status}` },
        { status: 400 }
      );
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
    if (!contentType.startsWith("video/")) {
      return NextResponse.json(
        { error: "The provided link does not point to a video file." },
        { status: 400 }
      );
    }

    const contentLengthHeader = response.headers.get("content-length");
    if (contentLengthHeader) {
      const remoteSize = Number(contentLengthHeader);
      if (!Number.isNaN(remoteSize) && remoteSize > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "File size must be less than 1GB" },
          { status: 400 }
        );
      }
    }

    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    let originalFileName = decodeURIComponent(pathSegments[pathSegments.length - 1] ?? "");
    if (!originalFileName) {
      originalFileName = parsedUrl.hostname.replace(/\./g, "-");
    }

    const extensionFromType = MIME_EXTENSION_MAP[contentType] ?? "";
    if (!originalFileName.includes(".") && extensionFromType) {
      originalFileName = `${originalFileName}.${extensionFromType}`;
    } else if (!originalFileName.includes(".")) {
      originalFileName = `${originalFileName}.mp4`;
    }

    const safeName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const storedFileName = `${timestamp}-${safeName}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    filePath = path.join(uploadsDir, storedFileName);

    const responseBody = response.body;
    if (!responseBody) {
      await cleanupPartialFile();
      return NextResponse.json(
        { error: "Video download failed: empty response body." },
        { status: 400 }
      );
    }

    const webStream = responseBody as unknown as NodeReadableStream<Uint8Array>;
    const nodeStream = Readable.fromWeb(webStream);
    let downloadedBytes = 0;
    const sizeGuard = new Transform({
      transform(chunk, _encoding, callback) {
        downloadedBytes += chunk.length;
        if (downloadedBytes > MAX_FILE_SIZE_BYTES) {
          controller.abort();
          callback(new Error("FILE_TOO_LARGE"));
          return;
        }
        callback(null, chunk);
      },
    });

    try {
      await pipeline(nodeStream, sizeGuard, createWriteStream(filePath));
    } catch (error) {
      await cleanupPartialFile();
      if (error instanceof Error && error.message === "FILE_TOO_LARGE") {
        return NextResponse.json(
          { error: "File size must be less than 1GB" },
          { status: 400 }
        );
      }

      console.error("❌ Failed while downloading video:", error);
      return NextResponse.json(
        { error: "Failed to download video from URL" },
        { status: 500 }
      );
    }

    if (downloadedBytes === 0) {
      await cleanupPartialFile();
      return NextResponse.json(
        { error: "Downloaded file is empty. Please check the video URL." },
        { status: 400 }
      );
    }

    const fileUrl = `/uploads/${storedFileName}`;
    const assetId = crypto.randomUUID();

    try {
      await db.insert(media_assets).values({
        id: assetId,
        userId: "anon",
        fileName: originalFileName,
        fileUrl,
        fileSize: downloadedBytes,
        status: "uploaded",
      });
    } catch (error) {
      await cleanupPartialFile();
      throw error;
    }

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        url: fileUrl,
        status: "uploaded",
        createdAt: new Date().toISOString(),
        title: originalFileName,
        originalFilename: originalFileName,
      },
    });
  } catch (error) {
    await cleanupPartialFile();
    console.error("❌ Failed to import from URL:", error);
    return NextResponse.json(
      { error: "Failed to import video from URL" },
      { status: 500 }
    );
  }
}
