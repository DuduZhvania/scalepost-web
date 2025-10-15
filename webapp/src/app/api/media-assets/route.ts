import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { media_assets } from "@/db/schema/media";

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
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // For now, we'll store the URL directly. In a real implementation,
    // you might want to download the video and upload it to UploadThing
    const fileName = url.split('/').pop() || 'imported-video';
    const assetId = crypto.randomUUID();

    await db.insert(media_assets).values({
      id: assetId,
      userId: 'anon',
      fileName: fileName,
      fileUrl: url,
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
      }
    });
  } catch (error) {
    console.error("❌ Failed to import from URL:", error);
    return NextResponse.json(
      { error: "Failed to import video from URL" },
      { status: 500 }
    );
  }
}
