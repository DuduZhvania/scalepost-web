import { NextResponse } from "next/server";

import { db } from "@/db";
import { mediaAsset } from "@/db/schema/media";

export async function GET() {
  const assets = await db.select().from(mediaAsset);

  return NextResponse.json(assets);
}
