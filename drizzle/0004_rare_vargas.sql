CREATE TABLE `agenda_staff` (
	`id` text PRIMARY KEY NOT NULL,
	`agenda_id` text NOT NULL,
	`staff_id` text NOT NULL,
	`session_role` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`agenda_id`) REFERENCES `agenda`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `survey_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`response_id` text NOT NULL,
	`question_id` text NOT NULL,
	`answer` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`response_id`) REFERENCES `survey_responses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `survey_questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `survey_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`survey_id` text NOT NULL,
	`question` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`options` text,
	`required` integer DEFAULT false NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `survey_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`survey_id` text NOT NULL,
	`participant_id` text,
	`submitted_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`is_complete` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `surveys` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`allow_anonymous` integer DEFAULT false NOT NULL,
	`allow_multiple_responses` integer DEFAULT false NOT NULL,
	`show_results` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`closed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
