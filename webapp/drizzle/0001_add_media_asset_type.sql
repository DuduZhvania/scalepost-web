ALTER TABLE "media_assets" ADD COLUMN "type" text DEFAULT 'file' NOT NULL;
ALTER TABLE "media_assets" ADD COLUMN "source_url" text;
