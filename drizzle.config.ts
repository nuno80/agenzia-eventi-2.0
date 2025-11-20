import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Load environment variables from .env.local
config({ path: '.env.local' })

export default defineConfig({
  schema: './src/db/libsql-schemas/*.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
})
