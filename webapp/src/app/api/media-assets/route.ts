import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createWriteStream } from "fs";
import { mkdir, unlink } from "fs/promises";
import { pipeline } from "stream/promises";
import { Readable, Transform } from "stream";
import type { ReadableStream as NodeReadableStream } from "stream/web";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { clips, media_assets } from "@/db/schema/media";
import { ensureMediaAssetColumns } from "@/lib/ensureMediaAssetColumns";

const MAX_FILE_SIZE_BYTES = 1073741824; // 1GB
const MIME_EXTENSION_MAP: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
};

export async function GET(request: NextRequest) {
  try {
    await ensureMediaAssetColumns();

    const typeParam = request.nextUrl.searchParams.get("type");
    const normalizedType =
      typeParam === "file" || typeParam === "link" ? typeParam : undefined;

    const baseQuery = db
      .select({
        id: media_assets.id,
        url: media_assets.fileUrl,
        status: media_assets.status,
        createdAt: media_assets.createdAt,
        duration: media_assets.duration,
        userId: media_assets.userId,
        title: media_assets.fileName,
        originalFilename: media_assets.fileName,
        fileName: media_assets.fileName,
        fileUrl: media_assets.fileUrl,
        fileSize: media_assets.fileSize,
        thumbnail: media_assets.thumbnail,
        metadata: media_assets.metadata,
        type: media_assets.type,
        sourceUrl: media_assets.sourceUrl,
        clipCount: sql<number>`coalesce(count(${clips.id}), 0)`,
      })
      .from(media_assets)
      .leftJoin(clips, eq(clips.mediaAssetId, media_assets.id));

    const query = normalizedType 
      ? baseQuery.where(eq(media_assets.type, normalizedType))
      : baseQuery;

    const assets = await query
      .groupBy(
        media_assets.id,
        media_assets.fileUrl,
        media_assets.status,
        media_assets.createdAt,
        media_assets.duration,
        media_assets.userId,
        media_assets.fileName,
        media_assets.fileSize,
        media_assets.thumbnail,
        media_assets.metadata,
        media_assets.type,
        media_assets.sourceUrl
      )
      .orderBy(desc(media_assets.createdAt));

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
      type: asset.type ?? "file",
      sourceUrl: asset.sourceUrl ?? null,
      clipCount: typeof asset.clipCount === "number" ? asset.clipCount : 0,
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
    await ensureMediaAssetColumns();

    const body = await req.json();
    const { url, fileName, fileSize, type, duration, thumbnail } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Check if this is a direct file save from UploadThing (already uploaded)
    // UploadThing URLs typically start with https:// and include uploadthing.com
    const isUploadThingFile = url.includes('uploadthing.com') || url.includes('utfs.io');
    
    if (isUploadThingFile && fileName) {
      // This is a file that's already uploaded to UploadThing
      // Just save the metadata to database
      const assetId = crypto.randomUUID();
      
      try {
        await db.insert(media_assets).values({
          id: assetId,
          userId: "anon",
          fileName: fileName,
          fileUrl: url,
          fileSize: fileSize || null,
          duration: duration || null,
          thumbnail: thumbnail || null,
          type: type === 'file' ? 'file' : 'link',
          sourceUrl: null,
          status: "uploaded",
        });

        return NextResponse.json({
          success: true,
          asset: {
            id: assetId,
            url: url,
            status: "uploaded",
            createdAt: new Date().toISOString(),
            title: fileName,
            originalFilename: fileName,
            type: type || "file",
            sourceUrl: null,
            durationS: null,
            clipCount: 0,
          },
        });
      } catch (error) {
        console.error("❌ Failed to save UploadThing file to database:", error);
        return NextResponse.json(
          { error: "Failed to save file metadata to database" },
          { status: 500 }
        );
      }
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

    const contentTypeHeader = response.headers.get("content-type");
    const contentType = contentTypeHeader ? contentTypeHeader.split(";")[0].trim().toLowerCase() : "";

    const ALLOWED_BINARY_TYPES = new Set([
      "application/octet-stream", 
      "binary/octet-stream",
      "application/force-download",
      "application/x-download",
      "application/download"
    ]);
    const ALLOWED_EXTENSIONS = new Set(["mp4", "mov", "webm", "mkv", "m4v", "avi", "flv", "3gp", "mpg", "mpeg"]);
    
    // Common video hosting domains that should be allowed even if content-type is not video/*
    const VIDEO_HOSTING_DOMAINS = new Set([
      "youtube.com", "youtu.be", "vimeo.com", "dailymotion.com", "twitch.tv", 
      "tiktok.com", "instagram.com", "facebook.com", "twitter.com", "x.com",
      "streamable.com", "gfycat.com", "imgur.com", "reddit.com"
    ]);

    const isVideoContentType = contentType.startsWith("video/");
    const isAllowedBinary = contentType !== "" && ALLOWED_BINARY_TYPES.has(contentType);
    const isVideoHostingService = VIDEO_HOSTING_DOMAINS.has(parsedUrl.hostname.toLowerCase());

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

    const extractExtension = (fileName: string) => {
      const match = fileName.match(/\.([a-z0-9]+)$/i);
      return match ? match[1].toLowerCase() : "";
    };

    const urlExtension = extractExtension(originalFileName);
    const extensionFromType = MIME_EXTENSION_MAP[contentType] ?? "";
    const resolvedExtension =
      extensionFromType ||
      (urlExtension && ALLOWED_EXTENSIONS.has(urlExtension) ? urlExtension : "");

    const shouldAllowByExtension = urlExtension !== "" && ALLOWED_EXTENSIONS.has(urlExtension);

    // Additional check for video-related keywords in URL path
    const urlPath = parsedUrl.pathname.toLowerCase();
    const hasVideoKeywords = urlPath.includes('video') || urlPath.includes('watch') || 
                            urlPath.includes('embed') || urlPath.includes('player');

    // More permissive validation - allow if it's a video hosting service, has video content-type, 
    // is an allowed binary type, has a video file extension, or contains video-related keywords
    if (!isVideoContentType && !isAllowedBinary && !shouldAllowByExtension && !isVideoHostingService && !hasVideoKeywords) {
      return NextResponse.json(
        { error: "The provided link does not point to a video file." },
        { status: 400 }
      );
    }

    const finalExtension =
      resolvedExtension || 
      (shouldAllowByExtension ? urlExtension : "") ||
      (isVideoHostingService ? "mp4" : "mp4");

    if (!originalFileName.includes(".")) {
      originalFileName = `${originalFileName}.${finalExtension}`;
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
        type: "link",
        sourceUrl: url,
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
        type: "link",
        sourceUrl: url,
        durationS: null,
        clipCount: 0,
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

export async function PATCH(req: NextRequest) {
  try {
    await ensureMediaAssetColumns();

    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!id) {
      return NextResponse.json(
        { error: "Media asset ID is required." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "A non-empty name is required." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(media_assets)
      .set({ fileName: name, updatedAt: new Date() })
      .where(eq(media_assets.id, id))
      .returning({
        id: media_assets.id,
        fileName: media_assets.fileName,
        fileUrl: media_assets.fileUrl,
        status: media_assets.status,
        createdAt: media_assets.createdAt,
        duration: media_assets.duration,
        userId: media_assets.userId,
        thumbnail: media_assets.thumbnail,
        type: media_assets.type,
        sourceUrl: media_assets.sourceUrl,
        updatedAt: media_assets.updatedAt,
      });

    if (!updated) {
      return NextResponse.json(
        { error: "Media asset not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      asset: {
        id: updated.id,
        name: updated.fileName,
        url: updated.fileUrl,
        status: updated.status,
        createdAt:
          updated.createdAt instanceof Date
            ? updated.createdAt.toISOString()
            : typeof updated.createdAt === "string"
              ? updated.createdAt
              : new Date().toISOString(),
        durationS: updated.duration ?? null,
        userId: updated.userId,
        thumbnail: updated.thumbnail ?? null,
        type: updated.type ?? "file",
        sourceUrl: updated.sourceUrl ?? null,
        updatedAt:
          updated.updatedAt instanceof Date
            ? updated.updatedAt.toISOString()
            : undefined,
      },
    });
  } catch (error) {
    console.error("❌ Failed to rename media asset:", error);
    return NextResponse.json(
      { error: "Failed to rename media asset." },
      { status: 500 }
    );
  }
}
