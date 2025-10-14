// components/upload/UploadModal.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, Check, AlertCircle, Video, Loader2, FileVideo } from 'lucide-react';
import { useUploadModal } from '@/hooks/useUploadModal';
import { useUploadThing } from '@/lib/uploadthing';

export function UploadModal() {
  const { isOpen, close, initialTab } = useUploadModal();
  const { startUpload, isUploading } = useUploadThing('mediaUploader');
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notifyUploadComplete = useCallback((detail: unknown) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('media:uploaded', { detail }));
    }
  }, []);

  const handleClose = useCallback(() => {
    setActiveTab('file');
    setUrl('');
    setUploadSuccess(false);
    setErrorMessage(undefined);
    setUploadProgress(0);
    setIsDragging(false);
    setSelectedFile(null);
    close();
  }, [close]);

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab(initialTab);
    setUploadSuccess(false);
    setErrorMessage(undefined);
    setUploadProgress(0);
    setIsDragging(false);
    setSelectedFile(null);
    if (initialTab === 'url') {
      setUrl('');
    }
  }, [isOpen, initialTab]);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploadSuccess(false);
      setErrorMessage(undefined);
      setUploadProgress(0);

      try {
        const result = await startUpload([file]);
        if (result && result.length > 0) {
          setUploadProgress(100);
          setUploadSuccess(true);
          notifyUploadComplete({ source: 'file', filename: file.name, uploadResult: result[0] });
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      }
    },
    [startUpload, notifyUploadComplete, handleClose]
  );

  const handleFileSelect = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('video/')) {
        setErrorMessage('Please upload a valid video file');
        return;
      }

      // Validate file size (1GB = 1073741824 bytes)
      if (file.size > 1073741824) {
        setErrorMessage('File size must be less than 1GB');
        return;
      }

      setSelectedFile(file);
      await handleUpload(file);
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('video/')
      );

      if (files.length > 0) {
        handleFileSelect(files);
      } else {
        setErrorMessage('Please upload a valid video file');
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUrlImport = useCallback(async () => {
    if (!url) return;
    setErrorMessage(undefined);
    setUploadProgress(0);

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
      setUploadProgress(100);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold">Upload Video</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Add content to your library
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition"
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
        <div className="p-6">
          {activeTab === 'file' ? (
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                  isDragging
                    ? 'border-white bg-zinc-800 scale-[1.02]'
                    : uploadSuccess
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
                }`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileSelect(Array.from(files));
                    }
                  }}
                  disabled={isUploading}
                />

                {isUploading ? (
                  <div className="space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <Loader2 className="w-16 h-16 text-white animate-spin" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">Uploading...</p>
                      {selectedFile && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-3">
                          <FileVideo className="w-4 h-4" />
                          <span>{selectedFile.name}</span>
                          <span>•</span>
                          <span>{formatFileSize(selectedFile.size)}</span>
                        </div>
                      )}
                      <div className="max-w-xs mx-auto">
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{uploadProgress}%</p>
                      </div>
                    </div>
                  </div>
                ) : uploadSuccess ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-1">Upload Complete!</p>
                      <p className="text-sm text-gray-400">
                        Your video is being processed
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-16 h-16 mx-auto bg-zinc-800 rounded-2xl flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        {isDragging ? 'Drop your video here' : 'Drag & drop your video'}
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
                      Choose File
                    </button>
                    <p className="text-xs text-gray-500">
                      Supports MP4, MOV, WEBM up to 1GB
                    </p>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-200">{errorMessage}</p>
                </div>
              )}
            </div>
          ) : (
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

                  {isUploading && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                        <span className="text-sm font-medium">Importing video...</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

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
