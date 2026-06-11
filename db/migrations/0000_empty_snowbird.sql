CREATE TABLE `article_claims` (
	`article_id` text,
	`claim_id` text
);
--> statement-breakpoint
CREATE TABLE `article_entities` (
	`article_id` text,
	`entity_id` text,
	`role` text
);
--> statement-breakpoint
CREATE TABLE `article_events` (
	`article_id` text,
	`event_id` text
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`outlet_id` text,
	`canonical_url` text,
	`title` text,
	`published_at` text,
	`language` text,
	`content_hash` text,
	`event_id` text,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text,
	`predicate` text,
	`object` text,
	`confidence` real
);
--> statement-breakpoint
CREATE TABLE `entities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`type` text,
	`normalized_name` text
);
--> statement-breakpoint
CREATE TABLE `event_claims` (
	`event_id` text,
	`claim_id` text
);
--> statement-breakpoint
CREATE TABLE `event_entities` (
	`event_id` text,
	`entity_id` text
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`first_seen_at` text,
	`last_seen_at` text,
	`status` text
);
--> statement-breakpoint
CREATE TABLE `outlet_articles` (
	`outlet_id` text,
	`article_id` text
);
--> statement-breakpoint
CREATE TABLE `outlets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`country` text
);
--> statement-breakpoint
CREATE TABLE `rss` (
	`id` text PRIMARY KEY NOT NULL,
	`outlet_id` text,
	`url` text
);
