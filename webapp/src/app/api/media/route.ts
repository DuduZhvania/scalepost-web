import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { mediaAssets } from "@/db/schema/media";
import { db } from "@/db";

export async function GET() {
  try {
    const results = await db
      .select()
      .from(mediaAssets)
      .orderBy(desc(mediaAssets.createdAt));
    return NextResponse.json(results);
  } catch (err) {
    console.error("❌ Error fetching assets:", err);
    return NextResponse.json(
      { error: "Failed to load assets" },
      { status: 500 }
    );
  }
}
