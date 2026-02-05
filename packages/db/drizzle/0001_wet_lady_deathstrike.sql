CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'other',
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tags_userId_idx` ON `tag` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_tag_name_per_user` ON `tag` (`userId`,`name`);--> statement-breakpoint
CREATE TABLE `transactionTag` (
	`transactionId` text NOT NULL,
	`tagId` text NOT NULL,
	PRIMARY KEY(`transactionId`, `tagId`),
	FOREIGN KEY (`transactionId`) REFERENCES `transaction`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `transactionTags_transactionId_idx` ON `transactionTag` (`transactionId`);--> statement-breakpoint
CREATE INDEX `transactionTags_tagId_idx` ON `transactionTag` (`tagId`);