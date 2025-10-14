import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Media Assets (uploaded videos)
export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().default('anon'),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  duration: integer('duration'), // in seconds
  thumbnail: text('thumbnail'),
  status: text('status').notNull().default('uploaded'), // uploaded | processing | ready | failed
  metadata: text('metadata'), // store width, height, codec, etc. as JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Generated Clips
export const clips = sqliteTable('clips', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  mediaAssetId: text('media_asset_id').notNull().references(() => mediaAssets.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().default('anon'),
  title: text('title'),
  description: text('description'),
  clipUrl: text('clip_url').notNull(),
  thumbnail: text('thumbnail'),
  startTime: integer('start_time').notNull(), // seconds
  endTime: integer('end_time').notNull(), // seconds
  duration: integer('duration').notNull(),
  score: integer('score'), // AI virality score (0-100)
  status: text('status').notNull().default('pending'), // pending | ready | posted | failed
  metadata: text('metadata'), // captions, hashtags, etc. as JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Social Media Accounts
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().default('anon'),
  platform: text('platform').notNull(), // tiktok | youtube | instagram | twitter
  accountName: text('account_name').notNull(),
  accountHandle: text('account_handle'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  credentials: text('credentials'), // encrypted tokens as JSON string
  metadata: text('metadata'), // followers, engagement rate, etc. as JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Campaigns (batch posting)
export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().default('anon'),
  name: text('name').notNull(),
  mediaAssetId: text('media_asset_id').references(() => mediaAssets.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('draft'), // draft | active | paused | completed
  targetPlatforms: text('target_platforms').notNull(), // ['tiktok', 'youtube'] as JSON string
  selectedAccounts: text('selected_accounts').notNull(), // [account_ids] as JSON string
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  settings: text('settings'), // posting frequency, rehash settings, etc. as JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Posts (actual distributed content)
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: text('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  clipId: text('clip_id').notNull().references(() => clips.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().default('anon'),
  platform: text('platform').notNull(),
  platformPostId: text('platform_post_id'), // ID from TikTok/YouTube/etc
  postUrl: text('post_url'),
  status: text('status').notNull().default('scheduled'), // scheduled | posting | posted | failed
  scheduledFor: integer('scheduled_for', { mode: 'timestamp' }),
  postedAt: integer('posted_at', { mode: 'timestamp' }),
  caption: text('caption'),
  hashtags: text('hashtags'), // as JSON string
  analytics: text('analytics'), // views, likes, shares, comments as JSON string
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Analytics tracking
export const analytics = sqliteTable('analytics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  shares: integer('shares').default(0),
  saves: integer('saves').default(0),
  engagementRate: integer('engagement_rate'), // percentage * 100
  watchTime: integer('watch_time'), // average watch time in seconds
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});