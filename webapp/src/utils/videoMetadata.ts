// utils/videoMetadata.ts
// Client-side video metadata extraction utilities

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  thumbnail?: string;
}

/**
 * Extract metadata from a video file (client-side)
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      const width = video.videoWidth;
      const height = video.videoHeight;

      // Clean up
      URL.revokeObjectURL(url);
      
      resolve({
        duration,
        width,
        height,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = url;
  });
}

/**
 * Generate a thumbnail from a video file (client-side)
 */
export async function generateVideoThumbnail(
  file: File,
  seekTime: number = 1
): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const url = URL.createObjectURL(file);

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Seek to a specific time (default 1 second)
      const seekTo = Math.min(seekTime, video.duration * 0.1);
      video.currentTime = seekTo;
    };

    video.onseeked = () => {
      try {
        // Set canvas size to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL (JPEG for smaller size)
        const thumbnailDataUrl = canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                URL.revokeObjectURL(url);
                resolve(reader.result as string);
              };
              reader.readAsDataURL(blob);
            } else {
              URL.revokeObjectURL(url);
              resolve(null);
            }
          },
          'image/jpeg',
          0.8
        );
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    video.src = url;
  });
}

/**
 * Extract both metadata and thumbnail from a video file
 */
export async function extractVideoMetadataWithThumbnail(
  file: File
): Promise<VideoMetadata & { thumbnail?: string }> {
  const [metadata, thumbnail] = await Promise.all([
    extractVideoMetadata(file),
    generateVideoThumbnail(file),
  ]);

  return {
    ...metadata,
    thumbnail: thumbnail || undefined,
  };
}

