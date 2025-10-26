// ============================================================================
// DRIZZLE ORM SCHEMA - BUDGET CATEGORIES TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/budgetCategories.ts
//
// PURPOSE: Defines the database schema for event budget categories and items
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// BUDGET CATEGORIES TABLE
// ============================================================================

export const budgetCategories = sqliteTable('budget_categories', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to events
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Category information
  name: text('name').notNull(),
  description: text('description'),

  // Budget information
  budgetAllocated: real('budget_allocated').notNull(),
  budgetSpent: real('budget_spent').default(0).notNull(),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// BUDGET ITEMS TABLE
// ============================================================================

export const budgetItems = sqliteTable('budget_items', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to budget categories
  categoryId: text('category_id')
    .notNull()
    .references(() => budgetCategories.id, { onDelete: 'cascade' }),

  // Item information
  name: text('name').notNull(),
  description: text('description'),

  // Cost information
  estimatedCost: real('estimated_cost').notNull(),
  actualCost: real('actual_cost'),
  quantity: integer('quantity').default(1).notNull(),

  // Status information
  status: text('status', {
    enum: ['planned', 'approved', 'purchased', 'invoiced', 'paid', 'cancelled'],
  })
    .default('planned')
    .notNull(),

  // Payment information
  vendorName: text('vendor_name'),
  invoiceNumber: text('invoice_number'),
  invoiceDate: integer('invoice_date', { mode: 'timestamp' }),
  paymentDate: integer('payment_date', { mode: 'timestamp' }),
  paymentMethod: text('payment_method'),

  // Additional information
  notes: text('notes'),
  attachments: text('attachments'), // JSON string of attachment URLs

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// INDEXES
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

export const budgetCategoriesEventIdIndex = index('budget_categories_event_id_idx').on(
  budgetCategories.eventId
)
export const budgetItemsCategoryIdIndex = index('budget_items_category_id_idx').on(
  budgetItems.categoryId
)
export const budgetItemsStatusIndex = index('budget_items_status_idx').on(budgetItems.status)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type BudgetCategory = typeof budgetCategories.$inferSelect
export type NewBudgetCategory = typeof budgetCategories.$inferInsert

export type BudgetItem = typeof budgetItems.$inferSelect
export type NewBudgetItem = typeof budgetItems.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createBudgetCategorySchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  name: z.string().min(1, 'Nome categoria richiesto').max(100),
  description: z.string().optional(),
  budgetAllocated: z.number().nonnegative('Budget allocato non può essere negativo'),
})

export const updateBudgetCategorySchema = createBudgetCategorySchema.partial()

export const createBudgetItemSchema = z.object({
  categoryId: z.string().min(1, 'ID categoria richiesto'),
  name: z.string().min(1, 'Nome voce richiesto').max(200),
  description: z.string().optional(),
  estimatedCost: z.number().nonnegative('Costo stimato non può essere negativo'),
  actualCost: z.number().nonnegative('Costo effettivo non può essere negativo').optional(),
  quantity: z.number().int().positive('Quantità deve essere positiva').default(1),
  status: z
    .enum(['planned', 'approved', 'purchased', 'invoiced', 'paid', 'cancelled'])
    .default('planned'),
  vendorName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.coerce.date().optional(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.string().optional(),
})

export const updateBudgetItemSchema = createBudgetItemSchema.partial()

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateBudgetCategoryInput = z.infer<typeof createBudgetCategorySchema>
export type UpdateBudgetCategoryInput = z.infer<typeof updateBudgetCategorySchema>

export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>
export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>
