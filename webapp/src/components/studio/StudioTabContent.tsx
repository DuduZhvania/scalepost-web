// components/studio/StudioTabContent.tsx
'use client';

import React from 'react';
import { Captions, Maximize2, Repeat, Palette, History } from 'lucide-react';

export function StudioCaptions() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Captions className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-bold mb-2">Captions Tool</h3>
        <p className="text-gray-400 max-w-md mb-6">
          Generate, style, and burn-in captions for your videos. Supports multiple languages and custom styling.
        </p>
        <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
          Coming Soon
        </button>
      </div>
    </div>
  );
}

export function StudioResize() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Maximize2 className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-bold mb-2">Resize Tool</h3>
        <p className="text-gray-400 max-w-md mb-6">
          Automatically resize and crop your videos to different aspect ratios with smart framing.
        </p>
        <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
          Coming Soon
        </button>
      </div>
    </div>
  );
}

export function StudioRehash() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Repeat className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-bold mb-2">Rehash Tool</h3>
        <p className="text-gray-400 max-w-md mb-6">
          Create variations of your clips to bypass duplicate detection. Randomize trims, styles, and effects.
        </p>
        <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
          Coming Soon
        </button>
      </div>
    </div>
  );
}

export function StudioTemplates() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Palette className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-bold mb-2">Brand Templates</h3>
        <p className="text-gray-400 max-w-md mb-6">
          Create and manage brand kits with your fonts, colors, logos, and caption presets.
        </p>
        <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
          Coming Soon
        </button>
      </div>
    </div>
  );
}

export function StudioHistory() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <History className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-bold mb-2">Studio History</h3>
        <p className="text-gray-400 max-w-md mb-6">
          View all your recent studio jobs, check status, and access outputs.
        </p>
        <div className="text-sm text-gray-500">No history yet</div>
      </div>
    </div>
  );
}
