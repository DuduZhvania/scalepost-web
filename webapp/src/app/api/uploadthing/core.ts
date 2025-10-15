import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from "@/db";
import { media_assets } from "@/db/schema/media";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({ video: { maxFileSize: "1GB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Uploaded:", file.url);
      
      // Save to database
      try {
        await db.insert(media_assets).values({
          userId: 'anon',
          fileName: file.name ?? 'Unknown',
          fileUrl: file.url,
          status: "uploaded",
        });
        console.log("✅ Saved to database:", file.url);
      } catch (error) {
        console.error("❌ Failed to save to database:", error);
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
