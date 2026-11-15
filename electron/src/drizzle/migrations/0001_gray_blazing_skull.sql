CREATE TABLE `Categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Categories_name_unique` ON `Categories` (`name`);--> statement-breakpoint
ALTER TABLE `AppSettings` ADD `categoryId` integer REFERENCES Categories(id) ON DELETE set null;