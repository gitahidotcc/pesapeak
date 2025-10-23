CREATE TABLE `apiKey` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer NOT NULL,
	`keyId` text NOT NULL,
	`keyHash` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apiKey_keyId_unique` ON `apiKey` (`keyId`);--> statement-breakpoint
CREATE UNIQUE INDEX `apiKey_name_userId_unique` ON `apiKey` (`name`,`userId`);