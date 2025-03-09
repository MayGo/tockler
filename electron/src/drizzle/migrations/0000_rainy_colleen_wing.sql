CREATE TABLE `AppSettings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`color` text
);
--> statement-breakpoint
CREATE TABLE `Settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`jsonData` text
);
--> statement-breakpoint
CREATE TABLE `TrackItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`app` text,
	`taskName` text,
	`title` text,
	`url` text,
	`color` text,
	`beginDate` text NOT NULL,
	`endDate` text NOT NULL
);
