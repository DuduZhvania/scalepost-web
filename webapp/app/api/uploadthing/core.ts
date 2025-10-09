import { createUploadthing, type FileRouter } from "uploadthing/next";

// ⬇️ import the db and table (match your project paths)
import { db } from "../../../src/db";
import { mediaAsset } from "../../../src/db/schema/media";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({ video: { maxFileSize: "1GB" } })
    .onUploadComplete(async ({ file }) => {
      // persist the upload
      await db.insert(mediaAsset).values({
        url: file.url,
        status: "uploaded",
      });
      console.log("✅ Saved upload to DB:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;



