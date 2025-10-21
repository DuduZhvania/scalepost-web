import { pgTable, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// Media Assets (uploaded videos)
export const media_assets = pgTable('media_assets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().default('anon'),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  duration: integer('duration'), // in seconds
  thumbnail: text('thumbnail'),
  status: text('status').notNull().default('uploaded'), // uploaded | processing | ready | failed
  metadata: jsonb('metadata'), // store width, height, codec, etc. as JSON
  type: text('type').$type<'file' | 'link'>().notNull().default('file'),
  sourceUrl: text('source_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Generated Clips
export const clips = pgTable('clips', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  mediaAssetId: text('media_asset_id').notNull().references(() => media_assets.id, { onDelete: 'cascade' }),
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
  metadata: jsonb('metadata'), // captions, hashtags, etc. as JSON
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Social Media Accounts
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().default('anon'),
  platform: text('platform').notNull(), // tiktok | youtube | instagram | twitter
  accountName: text('account_name').notNull(),
  accountHandle: text('account_handle'),
  isActive: boolean('is_active').notNull().default(true),
  credentials: jsonb('credentials'), // encrypted tokens as JSON
  metadata: jsonb('metadata'), // followers, engagement rate, etc. as JSON
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Campaigns (batch posting)
export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().default('anon'),
  name: text('name').notNull(),
  mediaAssetId: text('media_asset_id').references(() => media_assets.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('draft'), // draft | active | paused | completed
  targetPlatforms: jsonb('target_platforms').notNull(), // ['tiktok', 'youtube'] as JSON
  selectedAccounts: jsonb('selected_accounts').notNull(), // [account_ids] as JSON
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  settings: jsonb('settings'), // posting frequency, rehash settings, etc. as JSON
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Posts (actual distributed content)
export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: text('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  clipId: text('clip_id').notNull().references(() => clips.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().default('anon'),
  platform: text('platform').notNull(),
  platformPostId: text('platform_post_id'), // ID from TikTok/YouTube/etc
  postUrl: text('post_url'),
  status: text('status').notNull().default('scheduled'), // scheduled | posting | posted | failed
  scheduledFor: timestamp('scheduled_for'),
  postedAt: timestamp('posted_at'),
  caption: text('caption'),
  hashtags: jsonb('hashtags'), // as JSON
  analytics: jsonb('analytics'), // views, likes, shares, comments as JSON
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Analytics tracking
export const analytics = pgTable('analytics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  shares: integer('shares').default(0),
  saves: integer('saves').default(0),
  engagementRate: integer('engagement_rate'), // percentage * 100
  watchTime: integer('watch_time'), // average watch time in seconds
  recordedAt: timestamp('recorded_at').notNull().defaultNow(),
});
