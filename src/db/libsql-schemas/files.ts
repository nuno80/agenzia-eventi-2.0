// src/db/libsql-schemas/files.ts

import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const files = sqliteTable('files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'), // Nullable, senza foreign key
  filename: text('filename').notNull(),
  blobUrl: text('blob_url').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  uploadedAt: integer('uploaded_at').default(sql`(unixepoch())`).notNull(),
})

export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert
