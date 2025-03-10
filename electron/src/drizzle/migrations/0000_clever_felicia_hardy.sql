CREATE TABLE `AppSettings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `AppSettings_name_unique` ON `AppSettings` (`name`);--> statement-breakpoint
CREATE INDEX `app_settings_name` ON `AppSettings` (`name`);--> statement-breakpoint
CREATE TABLE `Settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`jsonData` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Settings_name_unique` ON `Settings` (`name`);--> statement-breakpoint
CREATE INDEX `settings_name` ON `Settings` (`name`);--> statement-breakpoint
CREATE TABLE `TrackItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app` text NOT NULL,
	`taskName` text,
	`title` text,
	`url` text,
	`color` text,
	`beginDate` integer NOT NULL,
	`endDate` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `track_items_begin_date` ON `TrackItems` (`beginDate`);--> statement-breakpoint
CREATE INDEX `track_items_end_date` ON `TrackItems` (`endDate`);--> statement-breakpoint
CREATE INDEX `track_items_task_name` ON `TrackItems` (`taskName`);