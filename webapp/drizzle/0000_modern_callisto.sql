CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text DEFAULT 'anon' NOT NULL,
	`platform` text NOT NULL,
	`account_name` text NOT NULL,
	`account_handle` text,
	`is_active` integer DEFAULT true NOT NULL,
	`credentials` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `analytics` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`views` integer DEFAULT 0,
	`likes` integer DEFAULT 0,
	`comments` integer DEFAULT 0,
	`shares` integer DEFAULT 0,
	`saves` integer DEFAULT 0,
	`engagement_rate` integer,
	`watch_time` integer,
	`recorded_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text DEFAULT 'anon' NOT NULL,
	`name` text NOT NULL,
	`media_asset_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`target_platforms` text NOT NULL,
	`selected_accounts` text NOT NULL,
	`scheduled_at` integer,
	`completed_at` integer,
	`settings` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `clips` (
	`id` text PRIMARY KEY NOT NULL,
	`media_asset_id` text NOT NULL,
	`user_id` text DEFAULT 'anon' NOT NULL,
	`title` text,
	`description` text,
	`clip_url` text NOT NULL,
	`thumbnail` text,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`duration` integer NOT NULL,
	`score` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text DEFAULT 'anon' NOT NULL,
	`file_name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_size` integer,
	`duration` integer,
	`thumbnail` text,
	`status` text DEFAULT 'uploaded' NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text,
	`clip_id` text NOT NULL,
	`account_id` text NOT NULL,
	`user_id` text DEFAULT 'anon' NOT NULL,
	`platform` text NOT NULL,
	`platform_post_id` text,
	`post_url` text,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`scheduled_for` integer,
	`posted_at` integer,
	`caption` text,
	`hashtags` text,
	`analytics` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`clip_id`) REFERENCES `clips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
