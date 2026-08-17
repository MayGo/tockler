CREATE TABLE `MatterTags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trackItemId` integer NOT NULL,
	`matterId` integer,
	`matchedText` text,
	`matchType` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`trackItemId`) REFERENCES `TrackItems`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`matterId`) REFERENCES `Matters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `matter_tags_track_item_id` ON `MatterTags` (`trackItemId`);--> statement-breakpoint
CREATE INDEX `matter_tags_matter_id` ON `MatterTags` (`matterId`);--> statement-breakpoint
CREATE TABLE `Matters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`caseReference` text NOT NULL,
	`clientName` text NOT NULL,
	`keywords` text,
	`color` text,
	`archived` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `matters_case_reference` ON `Matters` (`caseReference`);