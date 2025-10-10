import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  uuid, // <-- 1. IMPORT uuid
} from "drizzle-orm/pg-core";

/**
 * Enum for upload status.
 * You can extend this later with "processing", "failed", "posted", etc.
 */
export const uploadStatusEnum = pgEnum("upload_status", [
  "uploaded",
  "processing",
  "posted",
]);

/**
 * Table: media_asset
 * Stores uploaded videos, their URLs, and processing status.
 */
export const mediaAsset = pgTable("media_asset", {
  // 2. CHANGE text() to uuid()
  id: uuid("id").primaryKey().defaultRandom(), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
  url: text("url").notNull(), // UploadThing public URL
  status: uploadStatusEnum("status").notNull().default("uploaded"),
  durationS: integer("duration_s"), // optional: store clip duration
});