import { type Client, createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './libsql-schemas'

// Determine database configuration based on environment variables
let client: Client

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  // Use Turso database
  client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
} else {
  // Use local SQLite file
  client = createClient({
    url: 'file:test-libsql.db',
  })
}

// Initialize drizzle with the libsql client and schema
export const db = drizzle(client, { schema })

// Export the raw client for cases where we need to execute raw SQL
export { client }

export * from 'drizzle-orm/sql'
export * from './libsql-schemas'
