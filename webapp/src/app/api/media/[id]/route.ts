import { NextRequest, NextResponse } from "next/server";
import { mediaAssets } from "@/db/schema/media";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Added await

    const result = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Media asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("❌ Error fetching media asset:", err);
    return NextResponse.json(
      { error: "Failed to load media asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Added await

    const asset = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);

    if (asset.length === 0) {
      return NextResponse.json(
        { error: "Media asset not found" },
        { status: 404 }
      );
    }

    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));

    return NextResponse.json({ success: true, deletedAssetId: id });
  } catch (err) {
    console.error("❌ Error deleting media asset:", err);
    return NextResponse.json(
      { error: "Failed to delete media asset", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}