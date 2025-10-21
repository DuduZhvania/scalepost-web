// components/upload/UploadModal.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  X, Upload, Link as LinkIcon, Check, AlertCircle, Video, 
  Loader2, FileVideo, XCircle, RotateCcw, Trash2, CheckCircle2 
} from 'lucide-react';
import { useUploadModal } from '@/hooks/useUploadModal';
import { useUploadThing } from '@/lib/uploadthing';
import { extractVideoMetadata } from '@/utils/videoMetadata';

// File upload states
type FileStatus = 'queued' | 'uploading' | 'uploaded' | 'failed' | 'canceled';

interface QueuedFile {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  uploadedUrl?: string;
  dbSaved?: boolean;
  dbError?: string;
  cancelFn?: () => void;
  duration?: number;
  thumbnail?: string;
}

const MAX_FILES = 20;
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const VALID_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
const VALID_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.webm'];
const MAX_CONCURRENT_UPLOADS = 3;

export function UploadModal() {
  const { isOpen, close, initialTab } = useUploadModal();
  const { startUpload, isUploading } = useUploadThing('mediaUploader', {
    onClientUploadComplete: (res) => {
      console.log('✅ Upload complete:', res);
    },
    onUploadError: (error) => {
      console.error('❌ Upload error:', error);
    },
  });
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [fileQueue, setFileQueue] = useState<QueuedFile[]>([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadsRef = useRef(0);
  const uploadQueueRef = useRef<QueuedFile[]>([]);

  // Notify parent components
  const notifyUploadComplete = useCallback((detail: unknown) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('media:uploaded', { detail }));
    }
  }, []);

  const notifyBatchComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('media:batch-complete'));
    }
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setActiveTab('file');
    setUrl('');
    setUploadSuccess(false);
    setErrorMessage(undefined);
    setIsDragging(false);
    setFileQueue([]);
    setShowCloseConfirm(false);
    activeUploadsRef.current = 0;
    uploadQueueRef.current = [];
  }, []);

  const handleClose = useCallback(() => {
    const hasActiveUploads = fileQueue.some(f => f.status === 'uploading');
    
    if (hasActiveUploads) {
      setShowCloseConfirm(true);
      return;
    }
    
    resetState();
    close();
  }, [fileQueue, close, resetState]);

  const handleForceClose = useCallback(() => {
    // Cancel all active uploads
    fileQueue.forEach(file => {
      if (file.status === 'uploading' && file.cancelFn) {
        file.cancelFn();
      }
    });
    
    resetState();
    close();
  }, [fileQueue, close, resetState]);

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab(initialTab);
    setUploadSuccess(false);
    setErrorMessage(undefined);
    setIsDragging(false);
    setFileQueue([]);
    if (initialTab === 'url') {
      setUrl('');
    }
  }, [isOpen, initialTab]);

  // Validate a single file
  const validateFile = (file: File): string | null => {
    // Check file type
    const hasValidMimeType = VALID_MIME_TYPES.includes(file.type);
    const hasValidExtension = VALID_EXTENSIONS.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidMimeType && !hasValidExtension) {
      return `Invalid file type. Only MP4, MOV, MKV, and WEBM are supported.`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 2GB limit (${formatFileSize(file.size)})`;
    }

    if (file.size === 0) {
      return `File is empty`;
    }

    return null;
  };

  // Add files to queue
  const addFilesToQueue = useCallback((files: File[]) => {
      setErrorMessage(undefined);
    
    // Check total count
    const currentCount = fileQueue.length;
    const newCount = files.length;
    const totalCount = currentCount + newCount;
    
    if (totalCount > MAX_FILES) {
      setErrorMessage(`Cannot add ${newCount} files. Maximum ${MAX_FILES} files allowed (${currentCount} already queued)`);
      return;
    }

    const newQueuedFiles: QueuedFile[] = files.map(file => {
      const error = validateFile(file);
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        status: error ? 'failed' : 'queued',
        progress: 0,
        error: error || undefined,
      };
    });

    setFileQueue(prev => [...prev, ...newQueuedFiles]);
    // DON'T update uploadQueueRef here - only when user clicks "Start Upload"
  }, [fileQueue]);

  // Save to database
  const saveToDatabase = async (fileData: { 
    url: string; 
    name: string; 
    size: number; 
    type: string;
    duration?: number;
    thumbnail?: string;
  }): Promise<void> => {
    const response = await fetch('/api/media-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: fileData.url,
        fileName: fileData.name,
        fileSize: fileData.size,
        type: 'file',
        duration: fileData.duration,
        thumbnail: fileData.thumbnail,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to save to database' }));
      throw new Error(error.error || 'Failed to save to database');
    }
  };

  // Process next file in queue - defined before uploadSingleFile to avoid circular dependency
  const processNextInQueue = useCallback(() => {
    if (activeUploadsRef.current >= MAX_CONCURRENT_UPLOADS) {
      console.log('⏸️ Max concurrent uploads reached, waiting...');
      return;
    }

    const nextFile = uploadQueueRef.current.find(f => f.status === 'queued');
    if (!nextFile) {
      // Check if batch is complete
      const hasActiveFiles = uploadQueueRef.current.some(f => f.status === 'uploading');
      if (hasActiveFiles) {
        // Still have files uploading, don't notify yet
        return;
      }
      
      const allDone = uploadQueueRef.current.length > 0 && uploadQueueRef.current.every(f => 
        f.status === 'uploaded' || f.status === 'failed' || f.status === 'canceled'
      );
      
      if (allDone) {
        console.log('✅ Batch complete!');
        notifyBatchComplete();
      }
      return;
    }

    console.log('⏭️ Processing next file:', nextFile.file.name);
    activeUploadsRef.current++;
    
    // Call uploadSingleFile through a promise to avoid circular dependency
    uploadSingleFileInternal(nextFile);
  }, [notifyBatchComplete]);

  // Internal upload function
  const uploadSingleFileInternal = async (queuedFile: QueuedFile) => {
    const fileId = queuedFile.id;
    let isCanceled = false;

    // Check if already uploading or completed
    const currentFile = uploadQueueRef.current.find(f => f.id === fileId);
    if (currentFile && (currentFile.status === 'uploading' || currentFile.status === 'uploaded')) {
      console.log('⚠️ File already being processed:', fileId);
      return;
    }

    // Create cancel function
    const cancelFn = () => {
      isCanceled = true;
      setFileQueue(prev =>
        prev.map(f => f.id === fileId ? { ...f, status: 'canceled', cancelFn: undefined } : f)
      );
      uploadQueueRef.current = uploadQueueRef.current.map(f =>
        f.id === fileId ? { ...f, status: 'canceled', cancelFn: undefined } : f
      );
      activeUploadsRef.current--;
      processNextInQueue();
    };

    // Update status to uploading
    setFileQueue(prev =>
      prev.map(f => f.id === fileId ? { ...f, status: 'uploading', cancelFn } : f)
    );
    uploadQueueRef.current = uploadQueueRef.current.map(f =>
      f.id === fileId ? { ...f, status: 'uploading', cancelFn } : f
    );

    try {
      // Extract video metadata before uploading
      console.log('📹 Extracting video metadata for:', queuedFile.file.name);
      let videoDuration: number | undefined;
      let videoThumbnail: string | undefined;

      try {
        // Show "extracting metadata" status
        setFileQueue(prev =>
          prev.map(f => f.id === fileId ? { ...f, progress: 5 } : f)
        );

        const metadata = await extractVideoMetadata(queuedFile.file);
        videoDuration = metadata.duration;
        console.log('✅ Video metadata extracted:', {
          duration: videoDuration,
          width: metadata.width,
          height: metadata.height
        });
        
        // Update queue with duration (for display purposes)
        setFileQueue(prev =>
          prev.map(f => f.id === fileId ? { ...f, duration: videoDuration, progress: 10 } : f)
        );
        uploadQueueRef.current = uploadQueueRef.current.map(f =>
          f.id === fileId ? { ...f, duration: videoDuration } : f
        );
      } catch (metadataError) {
        console.warn('⚠️ Could not extract video metadata:', metadataError);
        // Continue with upload even if metadata extraction fails
      }

      // Simulate progress updates (UploadThing doesn't provide real-time progress in this hook)
      const progressInterval = setInterval(() => {
        if (isCanceled) {
          clearInterval(progressInterval);
          return;
        }
        
        setFileQueue(prev =>
          prev.map(f => {
            if (f.id === fileId && f.progress < 90) {
              return { ...f, progress: f.progress + Math.random() * 10 };
            }
            return f;
          })
        );
      }, 500);

      // Upload file to UploadThing
      console.log('🚀 Starting upload for:', queuedFile.file.name);
      
      const result = await startUpload([queuedFile.file]);
      clearInterval(progressInterval);

      if (isCanceled) {
        console.log('⚠️ Upload was canceled');
        return;
      }

      console.log('📦 Upload result:', result);

      if (!result) {
        throw new Error('Upload failed - no result returned. Please check your UploadThing configuration and network connection.');
      }

      if (result.length === 0) {
        throw new Error('Upload completed but returned empty array. This usually means the file was rejected by the server.');
      }

      const uploadedFile = result[0];
      console.log('✅ Uploaded file details:', uploadedFile);
      
      // UploadThing v7 returns: { url, name, size, key, customId, type, serverData }
      // The serverData contains what we returned from onUploadComplete
      const fileUrl = uploadedFile.url || uploadedFile.serverData?.url || '';
      const fileName = uploadedFile.name || uploadedFile.serverData?.name || queuedFile.file.name;
      const fileSize = uploadedFile.size || uploadedFile.serverData?.size || queuedFile.file.size;

      if (!fileUrl) {
        console.error('❌ No URL in upload response. Full response:', JSON.stringify(uploadedFile, null, 2));
        throw new Error('Upload completed but no URL was returned. Check server logs for details.');
      }
      
      console.log('✅ Extracted data - URL:', fileUrl, 'Name:', fileName, 'Size:', fileSize);
      
      // Update to uploaded status
      setFileQueue(prev =>
        prev.map(f => f.id === fileId 
          ? { ...f, status: 'uploaded', progress: 100, uploadedUrl: fileUrl, cancelFn: undefined }
          : f
        )
      );
      uploadQueueRef.current = uploadQueueRef.current.map(f =>
        f.id === fileId 
          ? { ...f, status: 'uploaded', progress: 100, uploadedUrl: fileUrl, cancelFn: undefined }
          : f
      );

      // Try to save to database
      try {
        await saveToDatabase({
          url: fileUrl,
          name: fileName,
          size: fileSize,
          type: queuedFile.file.type,
          duration: videoDuration,
          thumbnail: videoThumbnail,
        });

        setFileQueue(prev =>
          prev.map(f => f.id === fileId ? { ...f, dbSaved: true } : f)
        );
        uploadQueueRef.current = uploadQueueRef.current.map(f =>
          f.id === fileId ? { ...f, dbSaved: true } : f
        );

        // Notify first successful upload
        notifyUploadComplete({
          source: 'file',
          filename: fileName,
          url: fileUrl,
        });

      } catch (dbError) {
        console.error('Database save error:', dbError);
        setFileQueue(prev =>
          prev.map(f => f.id === fileId 
            ? { 
                ...f, 
                dbSaved: false, 
                dbError: dbError instanceof Error ? dbError.message : 'Database save failed' 
              }
            : f
          )
        );
        uploadQueueRef.current = uploadQueueRef.current.map(f =>
          f.id === fileId 
            ? { 
                ...f, 
                dbSaved: false, 
                dbError: dbError instanceof Error ? dbError.message : 'Database save failed' 
              }
            : f
        );
      }

    } catch (error) {
      if (isCanceled) return;
      
      console.error('Upload error:', error);
      setFileQueue(prev =>
        prev.map(f => f.id === fileId 
          ? { 
              ...f, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Upload failed',
              cancelFn: undefined 
            }
          : f
        )
      );
      uploadQueueRef.current = uploadQueueRef.current.map(f =>
        f.id === fileId 
          ? { 
              ...f, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Upload failed',
              cancelFn: undefined 
            }
          : f
      );
    } finally {
      activeUploadsRef.current--;
      processNextInQueue();
    }
  };

  // Start uploading all queued files
  const startBatchUpload = useCallback(() => {
    const validFiles = fileQueue.filter(f => f.status === 'queued');
    if (validFiles.length === 0) {
      console.log('⚠️ No valid files to upload');
      return;
    }

    console.log('🚀 Starting batch upload for', validFiles.length, 'files');
    
    // Initialize the upload queue ref with current file queue
    uploadQueueRef.current = [...fileQueue];
    activeUploadsRef.current = 0; // Reset counter
    
    // Start up to MAX_CONCURRENT_UPLOADS files
    const filesToStart = Math.min(MAX_CONCURRENT_UPLOADS, validFiles.length);
    console.log(`⏯️ Starting ${filesToStart} concurrent uploads`);
    
    for (let i = 0; i < filesToStart; i++) {
      processNextInQueue();
    }
  }, [fileQueue, processNextInQueue]);

  // Retry a failed file (upload or DB save)
  const retryFile = useCallback((fileId: string) => {
    const fileToRetry = fileQueue.find(f => f.id === fileId);
    if (!fileToRetry) return;

    // If upload succeeded but DB save failed, retry only DB save
    if (fileToRetry.uploadedUrl && fileToRetry.dbSaved === false) {
      setFileQueue(prev =>
        prev.map(f => f.id === fileId ? { ...f, dbError: undefined } : f)
      );

      const uploadedUrl = fileToRetry.uploadedUrl;
      const fileName = fileToRetry.file.name;

      saveToDatabase({
        url: uploadedUrl,
        name: fileName,
        size: fileToRetry.file.size,
        type: fileToRetry.file.type,
      })
        .then(() => {
          setFileQueue(prev =>
            prev.map(f => f.id === fileId ? { ...f, dbSaved: true } : f)
          );
          notifyUploadComplete({
            source: 'file',
            filename: fileName,
            url: uploadedUrl,
          });
        })
        .catch(error => {
          setFileQueue(prev =>
            prev.map(f => f.id === fileId 
              ? { 
                  ...f, 
                  dbSaved: false,
                  dbError: error instanceof Error ? error.message : 'Database save failed' 
                }
              : f
            )
          );
        });
      return;
    }

    // Otherwise, retry full upload
    const updatedFile = { ...fileToRetry, status: 'queued' as FileStatus, progress: 0, error: undefined, uploadedUrl: undefined };
    
    setFileQueue(prev =>
      prev.map(f => f.id === fileId ? updatedFile : f)
    );
    uploadQueueRef.current = uploadQueueRef.current.map(f => 
      f.id === fileId ? updatedFile : f
    );

    processNextInQueue();
  }, [fileQueue, processNextInQueue, notifyUploadComplete]);

  // Cancel a specific file
  const cancelFile = useCallback((fileId: string) => {
    const file = fileQueue.find(f => f.id === fileId);
    if (!file) return;

    if (file.status === 'uploading' && file.cancelFn) {
      file.cancelFn();
    } else if (file.status === 'queued') {
      setFileQueue(prev =>
        prev.map(f => f.id === fileId ? { ...f, status: 'canceled' } : f)
      );
      uploadQueueRef.current = uploadQueueRef.current.map(f => 
        f.id === fileId ? { ...f, status: 'canceled' } : f
      );
    }
  }, [fileQueue]);

  // Remove a file from queue
  const removeFile = useCallback((fileId: string) => {
    setFileQueue(prev => prev.filter(f => f.id !== fileId));
    uploadQueueRef.current = uploadQueueRef.current.filter(f => f.id !== fileId);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    if (!files || files.length === 0) return;
    addFilesToQueue(files);
  }, [addFilesToQueue]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  // Calculate overall progress
  const overallProgress = fileQueue.length > 0
    ? fileQueue.reduce((sum, f) => sum + f.progress, 0) / fileQueue.length
    : 0;

  const hasValidFiles = fileQueue.some(f => f.status === 'queued');
  const hasActiveUploads = fileQueue.some(f => f.status === 'uploading');
  const allCompleted = fileQueue.length > 0 && fileQueue.every(f => 
    f.status === 'uploaded' || f.status === 'failed' || f.status === 'canceled'
  );

  // URL import handler (keeping existing functionality)
  const handleUrlImport = useCallback(async () => {
    if (!url) return;
    setErrorMessage(undefined);

    try {
      new URL(url);
    } catch {
      setErrorMessage('Please enter a valid URL');
      return;
    }

    try {
      const response = await fetch('/api/media-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to import video' }));
        throw new Error(error.error || 'Failed to import video');
      }

      const result = await response.json();
      setUploadSuccess(true);
      notifyUploadComplete({ source: 'url', url, uploadResult: result.asset });
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('URL import error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Import failed');
    }
  }, [url, notifyUploadComplete, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Close Confirmation Dialog */}
      {showCloseConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md">
            <h3 className="text-lg font-bold mb-2">Uploads in Progress</h3>
            <p className="text-sm text-gray-400 mb-6">
              Closing now will cancel all active uploads. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
              >
                Continue Uploading
              </button>
              <button
                onClick={handleForceClose}
                className="flex-1 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Cancel & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold">Upload Videos</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Up to {MAX_FILES} videos • Max 2GB each
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'file'
                ? 'border-white text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            File Upload
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === 'url'
                ? 'border-white text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            Import URL
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'file' ? (
            <div className="space-y-4">
              {/* Drop Zone */}
              {fileQueue.length === 0 && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                  isDragging
                    ? 'border-white bg-zinc-800 scale-[1.02]'
                    : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
                }`}
                  onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                    accept={VALID_EXTENSIONS.join(',')}
                    multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileSelect(Array.from(files));
                    }
                  }}
                  />

                  <div className="space-y-6">
                    <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-2xl flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        {isDragging ? 'Drop your videos here' : 'Drag & drop videos'}
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        or click anywhere to browse files
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <Upload className="w-5 h-5" />
                      Choose Files
                    </button>
                    <p className="text-xs text-gray-500">
                      Supports MP4, MOV, MKV, WEBM • Up to {MAX_FILES} files • Max 2GB each
                    </p>
                  </div>
                </div>
              )}

              {/* File Queue */}
              {fileQueue.length > 0 && (
                <div className="space-y-4">
                  {/* Overall Progress */}
                  {(hasActiveUploads || allCompleted) && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Overall Progress</span>
                        <span className="text-gray-400">{Math.round(overallProgress)}%</span>
                      </div>
                      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {fileQueue.filter(f => f.status === 'uploaded').length} of {fileQueue.length} completed
                        </span>
                        {hasActiveUploads && (
                          <span>{fileQueue.filter(f => f.status === 'uploading').length} uploading</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* File List */}
                  <div className="space-y-2">
                    {fileQueue.map((queuedFile) => (
                      <FileQueueItem
                        key={queuedFile.id}
                        queuedFile={queuedFile}
                        onRetry={retryFile}
                        onCancel={cancelFile}
                        onRemove={removeFile}
                        formatFileSize={formatFileSize}
                      />
                    ))}
                  </div>

                  {/* Add More Button */}
                  {fileQueue.length < MAX_FILES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-zinc-700 rounded-lg text-sm text-gray-400 hover:border-zinc-600 hover:text-white hover:bg-zinc-800/50 transition"
                      disabled={hasActiveUploads}
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Add More Files ({fileQueue.length}/{MAX_FILES})
                    </button>
                  )}

                  {/* Start Upload Button */}
                  {!hasActiveUploads && !allCompleted && (
                    <button
                      onClick={startBatchUpload}
                      disabled={!hasValidFiles}
                      className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Upload ({fileQueue.filter(f => f.status === 'queued').length} files)
                    </button>
                  )}

                  {/* All Complete */}
                  {allCompleted && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 text-green-400 mb-4">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Batch Upload Complete</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        {fileQueue.filter(f => f.status === 'uploaded' && f.dbSaved).length} videos uploaded successfully
                      </p>
                      <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition"
                      >
                        Done
                      </button>
                  </div>
                )}
              </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-200">{errorMessage}</p>
                </div>
              )}
            </div>
          ) : (
            // URL Import Tab (existing functionality)
            <div>
              {uploadSuccess ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Import Started!</h3>
                  <p className="text-sm text-gray-400">
                    Your video is being processed and will appear in your library shortly.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-3 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                    <LinkIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      <p className="font-medium mb-1">Import from URL</p>
                      <p className="text-blue-300/80">
                        Paste a URL from YouTube, Vimeo, or any direct video link.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Video URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600/20 transition"
                      disabled={isUploading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && url && !isUploading) {
                          handleUrlImport();
                        }
                      }}
                    />
                  </div>

                  {errorMessage && (
                    <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-200">{errorMessage}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-lg font-medium hover:bg-zinc-950 transition disabled:opacity-50"
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUrlImport}
                      className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={!url || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4" />
                          Import Video
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// File Queue Item Component
function FileQueueItem({
  queuedFile,
  onRetry,
  onCancel,
  onRemove,
  formatFileSize,
}: {
  queuedFile: QueuedFile;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onRemove: (id: string) => void;
  formatFileSize: (bytes: number) => string;
}) {
  const { file, status, progress, error, dbSaved, dbError } = queuedFile;

  const getStatusColor = () => {
    switch (status) {
      case 'uploaded':
        return dbSaved ? 'border-green-500/40 bg-green-500/5' : 'border-yellow-500/40 bg-yellow-500/5';
      case 'uploading':
        return 'border-blue-500/40 bg-blue-500/5';
      case 'failed':
        return 'border-red-500/40 bg-red-500/5';
      case 'canceled':
        return 'border-gray-500/40 bg-gray-500/5';
      default:
        return 'border-zinc-700 bg-zinc-800/50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploaded':
        return dbSaved ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-400" />
        );
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <FileVideo className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(file.size)}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {status === 'uploading' && (
                <button
                  onClick={() => onCancel(queuedFile.id)}
                  className="p-1.5 hover:bg-zinc-700 rounded transition"
                  title="Cancel"
                  aria-label="Cancel upload"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              {(status === 'failed' || (status === 'uploaded' && dbSaved === false)) && (
                <button
                  onClick={() => onRetry(queuedFile.id)}
                  className="p-1.5 hover:bg-zinc-700 rounded transition"
                  title="Retry"
                  aria-label="Retry"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              {(status === 'queued' || status === 'failed' || status === 'canceled') && (
                <button
                  onClick={() => onRemove(queuedFile.id)}
                  className="p-1.5 hover:bg-zinc-700 rounded transition"
                  title="Remove"
                  aria-label="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {(status === 'uploading' || status === 'uploaded') && (
            <div className="space-y-1">
              <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    status === 'uploaded'
                      ? 'bg-green-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{Math.round(progress)}%</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}

          {/* DB Error Message */}
          {dbError && (
            <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Upload succeeded but database save failed: {dbError}
            </p>
          )}

          {/* Status Messages */}
          {status === 'uploaded' && dbSaved && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Upload complete & saved to library
            </p>
          )}
          {status === 'canceled' && (
            <p className="text-xs text-gray-400 mt-2">Upload canceled</p>
          )}
        </div>
      </div>
    </div>
  );
}
