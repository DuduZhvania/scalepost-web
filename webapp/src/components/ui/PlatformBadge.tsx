// components/ui/PlatformBadge.tsx
import React from 'react';

interface PlatformBadgeProps {
  platform: 'tiktok' | 'youtube' | 'instagram' | 'x';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const platformConfig = {
  tiktok: {
    name: 'TikTok',
    icon: 'T',
    color: 'from-pink-500 to-cyan-500',
    textColor: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  youtube: {
    name: 'YouTube',
    icon: 'Y',
    color: 'from-red-500 to-red-600',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  instagram: {
    name: 'Instagram',
    icon: 'I',
    color: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  x: {
    name: 'X',
    icon: 'X',
    color: 'from-blue-400 to-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
};

export function PlatformBadge({ platform, size = 'md', showLabel = false }: PlatformBadgeProps) {
  const config = platformConfig[platform];

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
        <span className={`flex items-center justify-center ${sizeClasses.sm} rounded-full bg-gradient-to-br ${config.color} text-white font-bold`}>
          {config.icon}
        </span>
        <span className="text-xs font-medium">{config.name}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded-full bg-gradient-to-br ${config.color} text-white font-bold`}
      title={config.name}
    >
      {config.icon}
    </span>
  );
}
