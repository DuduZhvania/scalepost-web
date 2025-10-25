// app/(dashboard)/campaigns/page.tsx
"use client";

import { 
  Plus, 
  Loader2, 
  Search, 
  Filter,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/ui/providers/ThemeProvider';
import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'paused' | 'completed' | 'draft';
  totalClips: number;
  postsScheduled: number;
  postsPublished: number;
  platforms: string[];
  startDate: string;
  createdAt: string;
  settings?: any;
  scheduledAt?: string | null;
}

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: '🎵',
  youtube: '▶️',
  instagram: '📸',
  twitter: '🐦',
  x: '✕',
};

export default function CampaignsPage() {
  const { theme } = useTheme();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const result = await response.json().catch((jsonError) => {
        console.error('JSON parse error:', jsonError);
        throw new Error('Invalid response format from server');
      });
      
      const campaignsData = result.campaigns || result;
      
      if (!Array.isArray(campaignsData)) {
        console.error('Campaigns data is not an array:', campaignsData);
        throw new Error('Invalid campaigns data format');
      }
      
      const transformedCampaigns: Campaign[] = campaignsData.map((campaign: any) => {
        try {
          return {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            totalClips: campaign.stats?.total || 0,
            postsScheduled: campaign.stats?.scheduled || 0,
            postsPublished: campaign.stats?.posted || 0,
            platforms: Array.isArray(campaign.targetPlatforms) 
              ? campaign.targetPlatforms 
              : (typeof campaign.targetPlatforms === 'string' 
                  ? JSON.parse(campaign.targetPlatforms || '[]') 
                  : []),
            startDate: campaign.scheduledAt || campaign.createdAt,
            createdAt: campaign.createdAt,
            settings: campaign.settings,
            scheduledAt: campaign.scheduledAt,
          };
        } catch (err) {
          console.error('Error transforming campaign:', campaign.id, err);
          throw err;
        }
      });
      
      setCampaigns(transformedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleToggleStatus = async (campaignId: string, currentStatus: string) => {
    setActionLoading(campaignId);
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, status: newStatus as any } : c
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!campaignToDelete || deleteConfirmText !== 'DELETE') return;
    
    setActionLoading(campaignToDelete);
    try {
      const response = await fetch(`/api/campaigns?id=${campaignToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete campaign');

      setCampaigns(prev => prev.filter(c => c.id !== campaignToDelete));
      setDeleteModalOpen(false);
      setDeleteConfirmText('');
      setCampaignToDelete(null);
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: 'pause' | 'resume' | 'delete') => {
    const ids = Array.from(selectedCampaigns);
    if (ids.length === 0) return;

    setActionLoading('bulk');
    try {
      if (action === 'delete') {
        await Promise.all(ids.map(id => 
          fetch(`/api/campaigns?id=${id}`, { method: 'DELETE' })
        ));
        setCampaigns(prev => prev.filter(c => !selectedCampaigns.has(c.id)));
        setSelectedCampaigns(new Set());
      } else {
        const newStatus = action === 'pause' ? 'paused' : 'active';
        await Promise.all(ids.map(id =>
          fetch(`/api/campaigns/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
        ));
        setCampaigns(prev => prev.map(c =>
          selectedCampaigns.has(c.id) ? { ...c, status: newStatus as any } : c
        ));
        setSelectedCampaigns(new Set());
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedCampaigns.size === filteredCampaigns.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const getStatusPill = (status: string, campaignId: string, interactive: boolean = false) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      active: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
      paused: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      draft: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
      scheduled: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      completed: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    };

    const style = styles[status] || styles.draft;

        return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (interactive && (status === 'active' || status === 'paused')) {
            handleToggleStatus(campaignId, status);
          }
        }}
        disabled={!interactive || actionLoading === campaignId}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border
          ${style.bg} ${style.text} ${style.border}
          ${interactive && (status === 'active' || status === 'paused') ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
          ${actionLoading === campaignId ? 'opacity-50' : ''}
        `}
      >
        {actionLoading === campaignId ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : status === 'active' ? (
            <Play className="w-3 h-3" />
        ) : status === 'paused' ? (
          <Pause className="w-3 h-3" />
        ) : status === 'scheduled' ? (
            <Clock className="w-3 h-3" />
        ) : status === 'completed' ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : null}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
    );
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = then.getTime() - now.getTime();
    const diffMinutes = Math.floor(diff / 60000);
    const diffHours = Math.floor(diff / 3600000);
    const diffDays = Math.floor(diff / 86400000);

    if (diff < 0) {
      const absDiffMinutes = Math.abs(diffMinutes);
      const absDiffHours = Math.abs(diffHours);
      const absDiffDays = Math.abs(diffDays);
      
      if (absDiffMinutes < 60) return `${absDiffMinutes}m ago`;
      if (absDiffHours < 24) return `${absDiffHours}h ago`;
      return `${absDiffDays}d ago`;
    }

    if (diffMinutes < 60) return `in ${diffMinutes}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    return `in ${diffDays}d`;
  };

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{
        background: theme === 'dark' ? '#000000' : '#fafafa',
        color: theme === 'dark' ? '#ffffff' : '#111827'
      }}
    >
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header Bar */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">Campaigns</h1>
          
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                style={{
                  background: theme === 'dark' ? '#171717' : '#ffffff',
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                }}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-2 rounded-lg border text-sm appearance-none cursor-pointer"
                style={{
                  background: theme === 'dark' ? '#171717' : '#ffffff',
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
          </div>

            {/* New Campaign Button */}
          <Link
            href="/campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition whitespace-nowrap"
              style={{
                background: theme === 'dark' ? '#e5e5e5' : '#111827',
                color: theme === 'dark' ? '#171717' : '#ffffff',
              }}
            >
              <Plus className="w-4 h-4" />
            New Campaign
          </Link>
          </div>
        </div>

        {loading ? (
          // Skeleton Loading
          <div className="space-y-0 border border-white/10 rounded-lg overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 border-b border-white/10 animate-pulse"
                style={{ background: theme === 'dark' ? '#0a0a0a' : '#ffffff' }}
              >
                <div className="w-4 h-4 bg-white/10 rounded"></div>
                <div className="flex-1 h-4 bg-white/10 rounded"></div>
                <div className="w-20 h-6 bg-white/10 rounded-full"></div>
                <div className="w-12 h-4 bg-white/10 rounded"></div>
                <div className="w-16 h-4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle className="w-12 h-12 mb-4" style={{ color: '#ef4444' }} />
            <h3 className="text-xl font-semibold mb-2">Error Loading Campaigns</h3>
            <p className="text-sm mb-4" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
              {error}
            </p>
            <button
              onClick={fetchCampaigns}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: theme === 'dark' ? '#171717' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
              }}
            >
              Try Again
            </button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div 
              className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: theme === 'dark' ? '#171717' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
              }}
            >
              <Calendar className="w-8 h-8" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }} />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No campaigns found' : 'No campaigns yet'}
            </h2>
            <p className="mb-6 max-w-md text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Launch your first campaign to automatically distribute content across platforms'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
            <Link
              href="/campaigns/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition"
                style={{
                  background: theme === 'dark' ? '#e5e5e5' : '#111827',
                  color: theme === 'dark' ? '#171717' : '#ffffff',
                }}
            >
              <Plus className="w-5 h-5" />
              Create Your First Campaign
            </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div 
              className="border rounded-lg overflow-hidden"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
              }}
            >
              {/* Table Header */}
              <div
                className="hidden md:grid grid-cols-[40px_2fr_120px_80px_120px_140px_140px_140px_140px_140px_40px] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b"
                style={{
                  background: theme === 'dark' ? '#0a0a0a' : '#f9fafb',
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                  color: theme === 'dark' ? '#a1a1a1' : '#6b7280',
                }}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.size === filteredCampaigns.length && filteredCampaigns.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </div>
                <div>Name</div>
                <div>Status</div>
                <div>Clips</div>
                <div>Published</div>
                <div>Platforms</div>
                <div>Schedule</div>
                <div>Posts/day</div>
                <div>Next post</div>
                <div>Last run</div>
                <div></div>
              </div>

              {/* Table Rows */}
              {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                  className="grid md:grid-cols-[40px_2fr_120px_80px_120px_140px_140px_140px_140px_140px_40px] gap-4 px-6 py-4 border-b group cursor-pointer transition-colors"
                  style={{
                    background: theme === 'dark' ? '#171717' : '#ffffff',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                  }}
                  onMouseEnter={(e) => {
                    if (theme === 'dark') {
                      e.currentTarget.style.background = 'rgba(229,229,229,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme === 'dark') {
                      e.currentTarget.style.background = '#171717';
                    }
                  }}
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setDrawerOpen(true);
                  }}
                >
                  {/* Checkbox */}
                  <div 
                    className="flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.has(campaign.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedCampaigns);
                        if (e.target.checked) {
                          newSelected.add(campaign.id);
                        } else {
                          newSelected.delete(campaign.id);
                        }
                        setSelectedCampaigns(newSelected);
                      }}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </div>

                  {/* Name */}
                  <div className="flex items-center">
                    <span className="font-semibold truncate">{campaign.name}</span>
                  </div>

                  {/* Status */}
                  <div 
                    className="flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getStatusPill(campaign.status, campaign.id, true)}
                  </div>

                  {/* Clips */}
                  <div className="flex items-center text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    {campaign.totalClips}
                  </div>

                  {/* Published */}
                  <div className="flex items-center text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    {campaign.postsPublished} / {campaign.postsScheduled}
                  </div>

                  {/* Platforms */}
                  <div className="flex items-center gap-1">
                    {campaign.platforms.length > 0 ? (
                      <>
                        {campaign.platforms.slice(0, 3).map((platform, i) => (
                          <span key={i} className="text-base" title={platform}>
                            {PLATFORM_ICONS[platform] || '•'}
                          </span>
                        ))}
                        {campaign.platforms.length > 3 && (
                          <span className="text-xs" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                            +{campaign.platforms.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs" style={{ color: theme === 'dark' ? '#525252' : '#d1d5db' }}>—</span>
                    )}
                  </div>

                  {/* Schedule */}
                  <div className="flex items-center text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    {campaign.scheduledAt ? (
                      new Date(campaign.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    ) : (
                      <span className="text-xs">Continuous</span>
                    )}
                  </div>

                  {/* Posts/day */}
                  <div className="flex items-center text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    {campaign.settings?.postsPerDay || '—'}
                  </div>

                  {/* Next post */}
                  <div className="flex items-center text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    {campaign.status === 'active' ? formatRelativeTime(new Date(Date.now() + 3600000).toISOString()) : '—'}
                  </div>

                  {/* Last run */}
                  <div className="flex items-center text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    {formatRelativeTime(campaign.createdAt)}
                  </div>

                  {/* Actions Kebab */}
                  <div 
                    className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative">
                      <button
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCampaign(campaign);
                          // TODO: Show dropdown menu
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile View - 2 lines */}
                  <div className="md:hidden col-span-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{campaign.name}</span>
                      {getStatusPill(campaign.status, campaign.id, true)}
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                      <span>{campaign.totalClips} clips</span>
                      <span>{campaign.postsPublished}/{campaign.postsScheduled} published</span>
                      <span>{campaign.platforms.length} platforms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bulk Actions Bar */}
            {selectedCampaigns.size > 0 && (
              <div
                className="fixed bottom-0 left-0 right-0 border-t px-6 py-4 flex items-center justify-between shadow-2xl z-50"
                style={{
                  background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {selectedCampaigns.size} selected
                  </span>
                  <button
                    onClick={() => setSelectedCampaigns(new Set())}
                    className="text-xs px-3 py-1 rounded hover:bg-white/10 transition-colors"
                    style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}
                  >
                    Clear
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('pause')}
                    disabled={actionLoading === 'bulk'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition border"
                    style={{
                      background: theme === 'dark' ? '#171717' : '#ffffff',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                    }}
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>

                  <button
                    onClick={() => handleBulkAction('resume')}
                    disabled={actionLoading === 'bulk'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition border"
                    style={{
                      background: theme === 'dark' ? '#171717' : '#ffffff',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </button>

                  <button
                    onClick={() => {
                      if (selectedCampaigns.size === 1) {
                        setCampaignToDelete(Array.from(selectedCampaigns)[0]);
                        setDeleteModalOpen(true);
                      } else {
                        if (confirm(`Delete ${selectedCampaigns.size} campaigns? This cannot be undone.`)) {
                          handleBulkAction('delete');
                        }
                      }
                    }}
                    disabled={actionLoading === 'bulk'}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Right Drawer */}
        {drawerOpen && selectedCampaign && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer Content */}
            <div
              className="relative w-full max-w-md h-full overflow-y-auto shadow-2xl"
              style={{
                background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
              }}
            >
              {/* Drawer Header */}
              <div 
                className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between"
                style={{
                  background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                }}
              >
                <h2 className="text-lg font-bold">Campaign Details</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6">
                {/* Campaign Name */}
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedCampaign.name}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusPill(selectedCampaign.status, selectedCampaign.id, false)}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      background: theme === 'dark' ? '#171717' : '#f9fafb',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                      Total Clips
                    </div>
                    <div className="text-2xl font-bold">{selectedCampaign.totalClips}</div>
                  </div>

                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      background: theme === 'dark' ? '#171717' : '#f9fafb',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                      Published
                    </div>
                    <div className="text-2xl font-bold">
                      {selectedCampaign.postsPublished}/{selectedCampaign.postsScheduled}
                    </div>
                  </div>
                </div>

                {/* Platforms */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    Platforms
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCampaign.platforms.map((platform, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-sm border"
                        style={{
                          background: theme === 'dark' ? '#171717' : '#f9fafb',
                          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                        }}
                      >
                        {PLATFORM_ICONS[platform] || '•'} {platform}
                      </span>
                    ))}
                    {selectedCampaign.platforms.length === 0 && (
                      <span className="text-sm" style={{ color: theme === 'dark' ? '#525252' : '#d1d5db' }}>
                        No platforms
                      </span>
                    )}
                  </div>
                </div>

                {/* Schedule Info */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    Schedule
                  </div>
                  <div className="text-sm" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    {selectedCampaign.scheduledAt 
                      ? `Started ${new Date(selectedCampaign.scheduledAt).toLocaleDateString()}`
                      : 'Continuous campaign'
                    }
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  <Link
                    href={`/campaigns/${selectedCampaign.id}/edit`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition border"
                    style={{
                      background: theme === 'dark' ? '#171717' : '#ffffff',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Campaign
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(selectedCampaign.id, selectedCampaign.status);
                    }}
                    disabled={actionLoading === selectedCampaign.id}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition border"
                    style={{
                      background: theme === 'dark' ? '#171717' : '#ffffff',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                    }}
                  >
                    {actionLoading === selectedCampaign.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : selectedCampaign.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause Campaign
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Resume Campaign
                      </>
                    )}
                  </button>

                  <button
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition border"
                    style={{
                      background: theme === 'dark' ? '#171717' : '#ffffff',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate Campaign
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCampaignToDelete(selectedCampaign.id);
                      setDeleteModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Campaign
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="pt-6 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    Recent Activity
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                      Campaign created {formatRelativeTime(selectedCampaign.createdAt)}
                    </div>
                    {selectedCampaign.postsPublished > 0 && (
                      <div className="text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                        {selectedCampaign.postsPublished} posts published
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteConfirmText('');
                setCampaignToDelete(null);
              }}
            />

            {/* Modal */}
            <div
              className="relative w-full max-w-md rounded-xl border p-6 shadow-2xl"
              style={{
                background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">Delete Campaign</h3>
                  <p className="text-sm" style={{ color: theme === 'dark' ? '#a1a1a1' : '#6b7280' }}>
                    This will permanently delete the campaign and all associated posts. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Type <span className="font-mono text-red-400">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border text-sm"
                  style={{
                    background: theme === 'dark' ? '#171717' : '#ffffff',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                  }}
                  placeholder="DELETE"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirmText('');
                    setCampaignToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition border"
                  style={{
                    background: theme === 'dark' ? '#171717' : '#ffffff',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== 'DELETE' || actionLoading === campaignToDelete}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === campaignToDelete ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Delete Campaign'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
