// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({ video: { maxFileSize: "1GB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Uploaded:", file.url);
    }),
} satisfies FileRouter;

// 👇 export this type
export type OurFileRouter = typeof ourFileRouter;
