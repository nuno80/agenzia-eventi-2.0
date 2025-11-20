/**
 * Event Management Dashboard - Complete Database Schema
 * ORM: Drizzle with SQLite (Torso)
 *
 * Tables:
 * - events: Core events table
 * - participants: Event participants/attendees
 * - speakers: Event speakers/presenters
 * - sponsors: Event sponsors
 * - agenda: Event sessions/schedule
 * - services: Event services (catering, AV, transport)
 * - budgetCategories: Budget categories for events
 * - budgetItems: Individual budget line items
 * - deadlines: Important deadlines/milestones
 * - communications: Email/notification log
 */

import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const timestamp = {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
}

// ============================================================================
// EVENTS TABLE (Core)
// ============================================================================

export const events = sqliteTable('events', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  // Basic Info
  title: text('title').notNull(),
  description: text('description'),
  tagline: text('tagline'), // Short description

  // Dates
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  registrationOpenDate: integer('registration_open_date', { mode: 'timestamp' }),
  registrationCloseDate: integer('registration_close_date', { mode: 'timestamp' }),

  // Location
  location: text('location').notNull(),
  venue: text('venue'),
  address: text('address'),
  city: text('city'),
  country: text('country').default('Italia'),

  // Capacity
  maxParticipants: integer('max_participants'),
  currentParticipants: integer('current_participants').default(0),

  // Status
  status: text('status', {
    enum: ['draft', 'planning', 'open', 'ongoing', 'completed', 'cancelled'],
  })
    .default('draft')
    .notNull(),

  // Visibility
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  requiresApproval: integer('requires_approval', { mode: 'boolean' }).default(false),

  // Media
  imageUrl: text('image_url'), // Main event image
  websiteUrl: text('website_url'),

  // Budget
  totalBudget: real('total_budget').default(0),
  currentSpent: real('current_spent').default(0),

  // Priority
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'urgent'],
  }).default('medium'),

  // Categories/Tags
  category: text('category'), // es: "Conferenza", "Workshop", "Webinar"
  tags: text('tags'), // JSON array di tags

  // Notes
  notes: text('notes'),

  ...timestamp,
})

// ============================================================================
// PARTICIPANTS TABLE
// ============================================================================

export const participants = sqliteTable('participants', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Personal Info
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),

  // Professional Info
  company: text('company'),
  jobTitle: text('job_title'),

  // Registration
  registrationDate: integer('registration_date', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  registrationStatus: text('registration_status', {
    enum: ['pending', 'confirmed', 'cancelled', 'waitlist'],
  })
    .default('pending')
    .notNull(),

  // Ticket
  ticketType: text('ticket_type'), // es: "Standard", "VIP", "Speaker"
  ticketPrice: real('ticket_price').default(0),
  paymentStatus: text('payment_status', {
    enum: ['pending', 'paid', 'refunded', 'free'],
  }).default('pending'),

  // Check-in
  checkedIn: integer('checked_in', { mode: 'boolean' }).default(false),
  checkinTime: integer('checkin_time', { mode: 'timestamp' }),

  // Communication
  emailsSent: integer('emails_sent').default(0),
  lastEmailDate: integer('last_email_date', { mode: 'timestamp' }),

  // Preferences
  dietaryRequirements: text('dietary_requirements'),
  specialNeeds: text('special_needs'),

  // Badge
  badgeGenerated: integer('badge_generated', { mode: 'boolean' }).default(false),
  qrCode: text('qr_code'), // QR code per check-in

  // Notes
  notes: text('notes'),

  ...timestamp,
})

// ============================================================================
// SPEAKERS TABLE
// ============================================================================

export const speakers = sqliteTable('speakers', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Personal Info
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),

  // Professional Info
  title: text('title'), // es: "Dr.", "Prof."
  company: text('company'),
  jobTitle: text('job_title'),
  bio: text('bio'),

  // Media
  photoUrl: text('photo_url'),
  websiteUrl: text('website_url'),
  linkedinUrl: text('linkedin_url'),
  twitterHandle: text('twitter_handle'),

  // Speaking Info
  sessionTitle: text('session_title'),
  sessionDescription: text('session_description'),
  sessionDate: integer('session_date', { mode: 'timestamp' }),
  sessionDuration: integer('session_duration'), // minuti

  // Status
  confirmationStatus: text('confirmation_status', {
    enum: ['invited', 'confirmed', 'declined', 'tentative'],
  })
    .default('invited')
    .notNull(),

  // Logistics
  travelRequired: integer('travel_required', { mode: 'boolean' }).default(false),
  accommodationRequired: integer('accommodation_required', { mode: 'boolean' }).default(false),
  fee: real('fee').default(0),

  // Materials
  presentationUploaded: integer('presentation_uploaded', { mode: 'boolean' }).default(false),
  presentationUrl: text('presentation_url'),

  // Notes
  notes: text('notes'),

  // Budget Integration
  budgetItemId: text('budget_item_id').references(() => budgetItems.id, { onDelete: 'set null' }),

  ...timestamp,
})

// ============================================================================
// SPONSORS TABLE
// ============================================================================

export const sponsors = sqliteTable('sponsors', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Company Info
  companyName: text('company_name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email').notNull(),
  phone: text('phone'),

  // Sponsorship
  sponsorshipLevel: text('sponsorship_level', {
    enum: ['platinum', 'gold', 'silver', 'bronze', 'partner'],
  }).notNull(),
  sponsorshipAmount: real('sponsorship_amount').notNull(),

  // Contract
  contractSigned: integer('contract_signed', { mode: 'boolean' }).default(false),
  contractDate: integer('contract_date', { mode: 'timestamp' }),
  contractUrl: text('contract_url'),

  // Payment
  paymentStatus: text('payment_status', {
    enum: ['pending', 'partial', 'paid'],
  })
    .default('pending')
    .notNull(),
  paymentDate: integer('payment_date', { mode: 'timestamp' }),

  // Branding
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  description: text('description'),

  // Benefits
  boothSpace: integer('booth_space', { mode: 'boolean' }).default(false),
  speakingSlot: integer('speaking_slot', { mode: 'boolean' }).default(false),
  freeTickets: integer('free_tickets').default(0),

  // Notes
  notes: text('notes'),

  ...timestamp,
})

// ============================================================================
// AGENDA TABLE (Event Sessions/Schedule)
// ============================================================================

export const agenda = sqliteTable('agenda', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Session Info
  title: text('title').notNull(),
  description: text('description'),

  // Timing
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  duration: integer('duration'), // minuti

  // Type
  sessionType: text('session_type', {
    enum: ['keynote', 'talk', 'workshop', 'panel', 'break', 'networking', 'other'],
  })
    .default('talk')
    .notNull(),

  // Location
  room: text('room'),
  location: text('location'),

  // Speaker
  speakerId: text('speaker_id').references(() => speakers.id, { onDelete: 'set null' }),

  // Capacity
  maxAttendees: integer('max_attendees'),

  // Status
  status: text('status', {
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
  })
    .default('scheduled')
    .notNull(),

  ...timestamp,
})

// ============================================================================
// SERVICES TABLE
// ============================================================================

export const services = sqliteTable('services', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Service Info
  serviceName: text('service_name').notNull(),
  serviceType: text('service_type', {
    enum: [
      'catering',
      'av_equipment',
      'photography',
      'videography',
      'transport',
      'security',
      'cleaning',
      'printing',
      'other',
    ],
  }).notNull(),

  // Provider
  providerName: text('provider_name'),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),

  // Contract
  contractStatus: text('contract_status', {
    enum: ['requested', 'quoted', 'contracted', 'delivered'],
  })
    .default('requested')
    .notNull(),

  // Cost
  quotedPrice: real('quoted_price'),
  finalPrice: real('final_price'),

  // Delivery
  deliveryDate: integer('delivery_date', { mode: 'timestamp' }),
  deliveryTime: text('delivery_time'),

  // Payment
  paymentStatus: text('payment_status', {
    enum: ['pending', 'paid'],
  })
    .default('pending')
    .notNull(),

  // Details
  description: text('description'),
  requirements: text('requirements'),

  // Budget Integration
  budgetItemId: text('budget_item_id').references(() => budgetItems.id, { onDelete: 'set null' }),

  // Notes
  notes: text('notes'),

  ...timestamp,
})

// ============================================================================
// BUDGET CATEGORIES TABLE
// ============================================================================

export const budgetCategories = sqliteTable('budget_categories', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Category Info
  name: text('name').notNull(),
  description: text('description'),

  // Budget
  allocatedAmount: real('allocated_amount').notNull().default(0),
  spentAmount: real('spent_amount').default(0),

  // Display
  color: text('color').default('#3B82F6'), // Per charts
  icon: text('icon'), // Nome icona

  ...timestamp,
})

// ============================================================================
// BUDGET ITEMS TABLE
// ============================================================================

export const budgetItems = sqliteTable('budget_items', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  categoryId: text('category_id')
    .notNull()
    .references(() => budgetCategories.id, { onDelete: 'cascade' }),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Item Info
  description: text('description').notNull(),

  // Amounts
  estimatedCost: real('estimated_cost').notNull(),
  actualCost: real('actual_cost'),

  // Status
  status: text('status', {
    enum: ['planned', 'approved', 'paid', 'invoiced'],
  })
    .default('planned')
    .notNull(),

  // Payment
  paymentDate: integer('payment_date', { mode: 'timestamp' }),
  invoiceNumber: text('invoice_number'),
  invoiceUrl: text('invoice_url'),

  // Provider
  vendor: text('vendor'),

  // Notes
  notes: text('notes'),

  ...timestamp,
})

// ============================================================================
// DEADLINES TABLE
// ============================================================================

export const deadlines = sqliteTable('deadlines', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Deadline Info
  title: text('title').notNull(),
  description: text('description'),

  // Date
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),

  // Priority
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'urgent'],
  })
    .default('medium')
    .notNull(),

  // Status
  status: text('status', {
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
  })
    .default('pending')
    .notNull(),
  completedDate: integer('completed_date', { mode: 'timestamp' }),

  // Assignment
  assignedTo: text('assigned_to'), // Nome persona responsabile

  // Category
  category: text('category'), // es: "Marketing", "Logistics", "Finance"

  // Notes
  notes: text('notes'),

  ...timestamp,
})

// ============================================================================
// COMMUNICATIONS TABLE
// ============================================================================

export const communications = sqliteTable('communications', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Email Info
  subject: text('subject').notNull(),
  body: text('body').notNull(),

  // Recipients
  recipientType: text('recipient_type', {
    enum: ['all_participants', 'confirmed_only', 'speakers', 'sponsors', 'custom'],
  }).notNull(),
  recipientCount: integer('recipient_count').default(0),

  // Status
  status: text('status', {
    enum: ['draft', 'scheduled', 'sent', 'failed'],
  })
    .default('draft')
    .notNull(),

  // Timing
  scheduledDate: integer('scheduled_date', { mode: 'timestamp' }),
  sentDate: integer('sent_date', { mode: 'timestamp' }),

  // Stats
  openRate: real('open_rate').default(0),
  clickRate: real('click_rate').default(0),

  // Template
  templateUsed: text('template_used'),

  // Notes
  notes: text('notes'),

  ...timestamp,
})

// ============================================================================
// RELATIONS
// ============================================================================

export const eventsRelations = relations(events, ({ many }) => ({
  participants: many(participants),
  speakers: many(speakers),
  sponsors: many(sponsors),
  agenda: many(agenda),
  services: many(services),
  budgetCategories: many(budgetCategories),
  budgetItems: many(budgetItems),
  deadlines: many(deadlines),
  communications: many(communications),
}))

export const participantsRelations = relations(participants, ({ one }) => ({
  event: one(events, {
    fields: [participants.eventId],
    references: [events.id],
  }),
}))

export const speakersRelations = relations(speakers, ({ one, many }) => ({
  event: one(events, {
    fields: [speakers.eventId],
    references: [events.id],
  }),
  sessions: many(agenda),
}))

export const sponsorsRelations = relations(sponsors, ({ one }) => ({
  event: one(events, {
    fields: [sponsors.eventId],
    references: [events.id],
  }),
}))

export const agendaRelations = relations(agenda, ({ one }) => ({
  event: one(events, {
    fields: [agenda.eventId],
    references: [events.id],
  }),
  speaker: one(speakers, {
    fields: [agenda.speakerId],
    references: [speakers.id],
  }),
}))

export const servicesRelations = relations(services, ({ one }) => ({
  event: one(events, {
    fields: [services.eventId],
    references: [events.id],
  }),
}))

export const budgetCategoriesRelations = relations(budgetCategories, ({ one, many }) => ({
  event: one(events, {
    fields: [budgetCategories.eventId],
    references: [events.id],
  }),
  items: many(budgetItems),
}))

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  event: one(events, {
    fields: [budgetItems.eventId],
    references: [events.id],
  }),
  category: one(budgetCategories, {
    fields: [budgetItems.categoryId],
    references: [budgetCategories.id],
  }),
}))

export const deadlinesRelations = relations(deadlines, ({ one }) => ({
  event: one(events, {
    fields: [deadlines.eventId],
    references: [events.id],
  }),
}))

export const communicationsRelations = relations(communications, ({ one }) => ({
  event: one(events, {
    fields: [communications.eventId],
    references: [events.id],
  }),
}))

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert

export type Speaker = typeof speakers.$inferSelect
export type NewSpeaker = typeof speakers.$inferInsert

export type Sponsor = typeof sponsors.$inferSelect
export type NewSponsor = typeof sponsors.$inferInsert

export type AgendaItem = typeof agenda.$inferSelect
export type NewAgendaItem = typeof agenda.$inferInsert

export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert

export type BudgetCategory = typeof budgetCategories.$inferSelect
export type NewBudgetCategory = typeof budgetCategories.$inferInsert

export type BudgetItem = typeof budgetItems.$inferSelect
export type NewBudgetItem = typeof budgetItems.$inferInsert

export type Deadline = typeof deadlines.$inferSelect
export type NewDeadline = typeof deadlines.$inferInsert

export type Communication = typeof communications.$inferSelect
export type NewCommunication = typeof communications.$inferInsert
