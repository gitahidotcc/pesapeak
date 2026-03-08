ALTER TABLE `transaction` ADD COLUMN `locationName` text;
--> statement-breakpoint
ALTER TABLE `transaction` ADD COLUMN `latitude` real;
--> statement-breakpoint
ALTER TABLE `transaction` ADD COLUMN `longitude` real;
--> statement-breakpoint
CREATE INDEX `transactions_locationName_idx` ON `transaction` (`locationName`);
