CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`password` text,
	`salt` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'user',
	`timezone` text DEFAULT 'UTC'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);