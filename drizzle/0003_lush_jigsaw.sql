CREATE TABLE `email_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`variables` text,
	`category` text DEFAULT 'custom',
	`event_id` text,
	`is_default` integer DEFAULT false,
	`usage_count` integer DEFAULT 0,
	`last_used_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `agenda_services` (
	`id` text PRIMARY KEY NOT NULL,
	`agenda_id` text NOT NULL,
	`service_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`agenda_id`) REFERENCES `agenda`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade
);
