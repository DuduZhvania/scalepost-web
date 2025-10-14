// components/studio/StudioLongToShort.tsx
'use client';

import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Library, Sparkles, Video } from 'lucide-react';
import { useUploadModal } from '@/hooks/useUploadModal';
import { useRouter } from 'next/navigation';

interface GeneratedClip {
  id: string;
  title: string;
  duration: number;
}

export function StudioLongToShort() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedClip[]>([]);
  const [settings, setSettings] = useState({
    clipLength: '60',
    numClips: '5',
    aspect: '9:16',
    style: 'viral',
  });
  const { open } = useUploadModal();
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Mock API call
    setTimeout(() => {
      setResults([
        { id: '1', title: 'Clip 1 - Best Hook', duration: 58 },
        { id: '2', title: 'Clip 2 - Key Point', duration: 62 },
        { id: '3', title: 'Clip 3 - Viral Moment', duration: 55 },
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      {/* Source Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">1. Choose Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => open({ tab: 'file' })}
            className="flex flex-col items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition group"
          >
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition" />
            <span className="font-medium">Upload File</span>
            <span className="text-xs text-gray-500">MP4, MOV, AVI</span>
          </button>

          <button
            type="button"
            onClick={() => open({ tab: 'url' })}
            className="flex flex-col items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition group"
          >
            <LinkIcon className="w-8 h-8 text-gray-400 group-hover:text-white transition" />
            <span className="font-medium">Paste URL</span>
            <span className="text-xs text-gray-500">YouTube, Vimeo, etc.</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/library')}
            className="flex flex-col items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition group"
          >
            <Library className="w-8 h-8 text-gray-400 group-hover:text-white transition" />
            <span className="font-medium">From Library</span>
            <span className="text-xs text-gray-500">Previously uploaded</span>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">2. Configure Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium mb-2">Clip Length (seconds)</label>
            <input
              type="number"
              value={settings.clipLength}
              onChange={(e) => setSettings({ ...settings, clipLength: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Number of Clips</label>
            <input
              type="number"
              value={settings.numClips}
              onChange={(e) => setSettings({ ...settings, numClips: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
            <select
              value={settings.aspect}
              onChange={(e) => setSettings({ ...settings, aspect: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
            >
              <option value="9:16">9:16 (Vertical)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Horizontal)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Style Preset</label>
            <select
              value={settings.style}
              onChange={(e) => setSettings({ ...settings, style: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-zinc-600"
            >
              <option value="viral">Viral (High Energy)</option>
              <option value="educational">Educational</option>
              <option value="storytelling">Storytelling</option>
              <option value="highlights">Best Moments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              Generating Clips...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Clips
            </>
          )}
        </button>
      </div>

      {/* Results Grid */}
      {results.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">Generated Clips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((clip) => (
              <div
                key={clip.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition"
              >
                <div className="aspect-video bg-zinc-950 flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-700" />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold mb-2">{clip.title}</h4>
                  <p className="text-sm text-gray-400 mb-4">{clip.duration}s</p>
                  <button className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm font-medium hover:bg-zinc-950 transition">
                    Open in Editor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
