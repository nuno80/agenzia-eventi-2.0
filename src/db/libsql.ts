import { type Client, createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './libsql-schemas'

// Require Turso database credentials
if (!process.env.TURSO_CONNECTION_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error(
    'Missing Turso database credentials. Please set TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN in .env.local'
  )
}

// Create Turso client
const client: Client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Initialize drizzle with the libsql client and schema
export const db = drizzle(client, { schema })

// Export the raw client for cases where we need to execute raw SQL
export { client }

export * from 'drizzle-orm/sql'
export * from './libsql-schemas'
