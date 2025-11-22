ALTER TABLE `services` ADD `budget_item_id` text REFERENCES budget_items(id);--> statement-breakpoint
ALTER TABLE `speakers` ADD `budget_item_id` text REFERENCES budget_items(id);--> statement-breakpoint
ALTER TABLE `staff_assignments` ADD `budget_item_id` text;