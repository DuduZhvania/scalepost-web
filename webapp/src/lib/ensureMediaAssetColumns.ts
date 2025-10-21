import { sql } from "drizzle-orm";
import { db } from "@/db";

let ensured = false;

export async function ensureMediaAssetColumns() {
  if (ensured) return;

  try {
    await db.execute(
      sql`ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS type text`
    );
    await db.execute(
      sql`ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS source_url text`
    );
    await db.execute(
      sql`UPDATE media_assets SET type = 'file' WHERE type IS NULL`
    );
    await db.execute(
      sql`ALTER TABLE media_assets ALTER COLUMN type SET DEFAULT 'file'`
    );
    await db.execute(sql`ALTER TABLE media_assets ALTER COLUMN type SET NOT NULL`);
    ensured = true;
  } catch (error) {
    console.error("Failed to ensure media_assets schema:", error);
  }
}
