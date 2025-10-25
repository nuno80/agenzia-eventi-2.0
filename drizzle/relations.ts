import { relations } from 'drizzle-orm/relations'
import { files, users } from './schema'

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  files: many(files),
}))
