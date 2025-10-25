import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './libsql-schemas';

// Connect to Turso using environment variables
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
});

// Initialize drizzle with the libsql client and schema
export const db = drizzle(client, { schema });

export * from './libsql-schemas';
export * from 'drizzle-orm/sql';