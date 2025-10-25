// lib/schema.ts

import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 🔐 IMPORTANTE: Quando implementi Clerk, userId diventa TEXT
// Clerk usa stringhe come "user_2abc123xyz" non numeri
export const files = sqliteTable('files', {
  id: integer().primaryKey({ autoIncrement: true }).notNull(),

  // 🔐 STEP CLERK: Cambia da integer a text quando implementi Clerk
  // PRIMA (attuale - per test):
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),

  // DOPO (con Clerk - decommenta e rimuovi la riga sopra):
  // userId: text("user_id").notNull(),
  // NON serve più la foreign key perché Clerk gestisce gli utenti esternamente

  filename: text().notNull(),
  blobUrl: text('blob_url').notNull(),
  contentType: text('content_type').notNull(),
  size: integer().notNull(),
  uploadedAt: integer('uploaded_at').default(sql`(unixepoch())`).notNull(),
})

// 🔐 OPZIONALE: Puoi mantenere questa tabella per dati extra degli utenti
// o eliminarla completamente se usi solo Clerk
export const users = sqliteTable(
  'users',
  {
    id: integer().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)]
)

// 🔐 ALTERNATIVA CON CLERK: Tabella per metadata aggiuntivi degli utenti
// Crea questa tabella se vuoi salvare dati extra non gestiti da Clerk
// export const userMetadata = sqliteTable("user_metadata", {
//   id: integer().primaryKey({ autoIncrement: true }).notNull(),
//   clerkUserId: text("clerk_user_id").notNull().unique(), // ID di Clerk
//   preferences: text().default('{}'), // JSON stringificato
//   quota: integer().default(0), // es. spazio usato
//   createdAt: integer("created_at").default(sql`(unixepoch())`).notNull(),
// });
