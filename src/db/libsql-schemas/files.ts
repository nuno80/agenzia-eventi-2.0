import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  blobUrl: text('blob_url').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;