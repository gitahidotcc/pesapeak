ALTER TABLE `transaction` ADD `locationName` text;--> statement-breakpoint
ALTER TABLE `transaction` ADD `latitude` real;--> statement-breakpoint
ALTER TABLE `transaction` ADD `longitude` real;--> statement-breakpoint
CREATE INDEX `transactions_locationName_idx` ON `transaction` (`locationName`);