import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { media_assets } from "@/db/schema/media";
import { ensureMediaAssetColumns } from "@/lib/ensureMediaAssetColumns";

export async function POST(request: NextRequest) {
  try {
    await ensureMediaAssetColumns();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "File must be a video" },
        { status: 400 }
      );
    }

    // Validate file size (1GB max)
    if (file.size > 1073741824) {
      return NextResponse.json(
        { error: "File size must be less than 1GB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist, that's fine
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    const fileUrl = `/uploads/${fileName}`;
    await db.insert(media_assets).values({
      userId: "anon",
      fileName: file.name,
      fileUrl: fileUrl,
      fileSize: file.size,
      type: "file",
      sourceUrl: null,
      status: "uploaded",
    });

    console.log("✅ File uploaded successfully:", fileUrl);

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        url: fileUrl,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
