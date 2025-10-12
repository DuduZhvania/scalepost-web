import { createUploadthing, type FileRouter } from "uploadthing/next";

import { db } from "@/db";
import { mediaAsset } from "@/db/schema/media";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({ video: { maxFileSize: "1GB" } })
    .onUploadComplete(async ({ file }) => {
      await db.insert(mediaAsset).values({
        url: file.url,
        status: "uploaded",
      });

      console.log("Uploaded:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;


