import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({ 
    video: { 
      maxFileSize: "2GB",
      maxFileCount: 20,
    } 
  })
    .middleware(async ({ files }) => {
      // Validate file types on server side
      const validMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
      
      console.log("🔍 Validating files:", files.map(f => ({ name: f.name, type: f.type, size: f.size })));
      
      for (const file of files) {
        if (!validMimeTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}. Only MP4, MOV, MKV, and WEBM are allowed.`);
        }
      }
      
      return { uploadedBy: 'user', timestamp: Date.now() };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("✅ File uploaded successfully:", {
        url: file.url,
        name: file.name,
        size: file.size,
        key: file.key,
        metadata
      });
      
      // Return file data to client
      // In UploadThing v7, the client receives this return value
      return {
        url: file.url,
        name: file.name,
        size: file.size,
        key: file.key,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
