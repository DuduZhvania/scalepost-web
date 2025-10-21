'use client';

import { useEffect } from 'react';
import { 
  X, Video, Clock, HardDrive, Film, Calendar, Sparkles, 
  TrendingUp, Eye, Heart, Share2, MessageCircle, Timer,
  Target, Zap, CheckCircle2
} from 'lucide-react';

interface VideoStats {
  id: string;
  fileName: string;
  duration?: number;
  fileSize?: number;
  format?: string;
  uploadedAt: string;
  clipCount: number;
  status: string;
}

interface ClipStats {
  id: string;
  title: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  avgWatchTime: number;
  score?: number;
  platforms: {
    name: string;
    views: number;
    isBest?: boolean;
  }[];
  campaignCount: number;
}

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'video' | 'clip';
  videoStats?: VideoStats;
  clipStats?: ClipStats;
  onGenerateClips?: () => void;
}

export function StatsPanel({
  isOpen,
  onClose,
  type,
  videoStats,
  clipStats,
  onGenerateClips,
}: StatsPanelProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && videoStats) {
      console.log('📊 StatsPanel received videoStats:', videoStats);
    }
  }, [isOpen, videoStats]);

  if (!isOpen) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number | null) => {
    if (seconds === null || seconds === undefined || seconds <= 0) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number, total: number) => {
    if (total === 0) return '0%';
    return ((num / total) * 100).toFixed(1) + '%';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div
          className="relative w-full max-w-lg max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {type === 'video' && videoStats ? (
          <div className="flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 px-6 py-5 z-10 rounded-t-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Video className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <h2 className="text-lg font-bold text-white truncate">
                      {videoStats.fileName}
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-400">Video Statistics</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 hover:bg-zinc-800 rounded-lg transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-6 space-y-8">
              {/* Overview Section */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                  Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-zinc-400">Duration:</span>
                    <span className="text-white font-medium ml-auto">
                      {formatDuration(videoStats.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span className="text-zinc-400">File size:</span>
                    <span className="text-white font-medium ml-auto">
                      {formatBytes(videoStats.fileSize)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span className="text-zinc-400">Format:</span>
                    <span className="text-white font-medium ml-auto">
                      {videoStats.format || 'MP4 1080p'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-zinc-400">Uploaded:</span>
                    <span className="text-white font-medium ml-auto">
                      {formatDate(videoStats.uploadedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clip Generation Section */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                  Clip Generation
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-zinc-400">Total clips:</span>
                    <span className="text-white font-medium ml-auto">
                      {videoStats.clipCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-400">Status:</span>
                    <span className="text-white font-medium ml-auto">
                      {videoStats.clipCount > 0 ? 'Clips generated' : 'Ready to generate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              {onGenerateClips && videoStats.clipCount === 0 && (
                <button
                  onClick={onGenerateClips}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 text-black font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Clips Now
                </button>
              )}
            </div>
          </div>
        ) : type === 'clip' && clipStats ? (
          <div className="flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 px-6 py-5 z-10 rounded-t-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Film className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <h2 className="text-lg font-bold text-white truncate">
                      {clipStats.title}
                    </h2>
                  </div>
                  <p className="text-sm text-zinc-400">Clip Performance</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 hover:bg-zinc-800 rounded-lg transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-6 space-y-8">
              {/* Coming Soon Message */}
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30">
                  <TrendingUp className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Clip Tracking Coming Soon
                </h3>
                <p className="text-sm text-zinc-400 max-w-sm">
                  We&apos;re building powerful analytics to track your clip performance across all platforms. Stay tuned!
                </p>
              </div>

              {/* Placeholder Info */}
              <div className="border-t border-zinc-800 pt-6">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
                  What&apos;s Coming
                </h4>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Real-time view counts across platforms</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Engagement metrics (likes, shares, comments)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Virality score and performance insights</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Campaign tracking and ROI analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        </div>
      </div>
    </>
  );
}

