// ============================================================================
// DATABASE SETUP - COMPLETE GUIDE
// ============================================================================
// This file contains all the setup needed for your Event Management database
// ============================================================================

// ============================================================================
// FILE 1: src/lib/db/index.ts - Database Connection
// ============================================================================

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

// Create SQLite database instance
const sqlite = new Database('./event-manager.db')

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL')

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema })

// Export Database type for migrations
export type DB = typeof db
