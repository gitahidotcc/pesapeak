CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
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
CREATE UNIQUE INDEX `apiKey_name_userId_unique` ON `apiKey` (`name`,`userId`);--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`folderId` text NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT 'banknote' NOT NULL,
	`color` text DEFAULT '#222222' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`folderId`) REFERENCES `categoryFolder`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `categories_userId_idx` ON `category` (`userId`);--> statement-breakpoint
CREATE INDEX `categories_folderId_idx` ON `category` (`folderId`);--> statement-breakpoint
CREATE TABLE `categoryFolder` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT 'banknote' NOT NULL,
	`color` text DEFAULT '#222222' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `categoryFolders_userId_idx` ON `categoryFolder` (`userId`);--> statement-breakpoint
CREATE TABLE `financialAccount` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`accountType` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`color` text DEFAULT '#222222' NOT NULL,
	`icon` text DEFAULT 'bank' NOT NULL,
	`notes` text DEFAULT '',
	`initialBalance` integer DEFAULT 0,
	`totalBalance` integer DEFAULT 0,
	`defaultAccount` integer DEFAULT false,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_default_per_user` ON `financialAccount` (`userId`,`defaultAccount`) WHERE "financialAccount"."defaultAccount" = 1;--> statement-breakpoint
CREATE TABLE `passwordResetToken` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `passwordResetToken_token_unique` ON `passwordResetToken` (`token`);--> statement-breakpoint
CREATE INDEX `passwordResetTokens_userId_idx` ON `passwordResetToken` (`userId`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`ipAddress` text,
	`userAgent` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`accountId` text,
	`categoryId` text,
	`fromAccountId` text,
	`toAccountId` text,
	`parentTransactionId` text,
	`isFee` integer DEFAULT false,
	`date` integer NOT NULL,
	`time` text,
	`notes` text DEFAULT '',
	`attachmentPath` text,
	`attachmentFileName` text,
	`attachmentMimeType` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`accountId`) REFERENCES `financialAccount`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`fromAccountId`) REFERENCES `financialAccount`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`toAccountId`) REFERENCES `financialAccount`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `transactions_userId_idx` ON `transaction` (`userId`);--> statement-breakpoint
CREATE INDEX `transactions_accountId_idx` ON `transaction` (`accountId`);--> statement-breakpoint
CREATE INDEX `transactions_fromAccountId_idx` ON `transaction` (`fromAccountId`);--> statement-breakpoint
CREATE INDEX `transactions_toAccountId_idx` ON `transaction` (`toAccountId`);--> statement-breakpoint
CREATE INDEX `transactions_categoryId_idx` ON `transaction` (`categoryId`);--> statement-breakpoint
CREATE INDEX `transactions_date_idx` ON `transaction` (`date`);--> statement-breakpoint
CREATE INDEX `transactions_parentTransactionId_idx` ON `transaction` (`parentTransactionId`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`password` text,
	`salt` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'user',
	`createdAt` integer NOT NULL,
	`updatedAt` integer,
	`timezone` text DEFAULT 'UTC',
	`language` text DEFAULT 'en',
	`isOnboarded` integer DEFAULT false,
	`onboardingStep` integer DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer
);
