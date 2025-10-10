// webapp/src/db/schema/media.ts
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const mediaAsset = pgTable("media_asset", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  url: text("url").notNull(),                     // UploadThing file URL
  status: text("status").notNull().default("uploaded"), // uploaded|processed|posted (expand later)
  durationS: integer("duration_s"),              // optional later
});
