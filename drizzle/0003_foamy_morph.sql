DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);