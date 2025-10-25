DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `files` ALTER COLUMN "uploaded_at" TO "uploaded_at" integer DEFAULT (unixepoch());--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);