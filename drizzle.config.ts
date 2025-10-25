import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/libsql-schemas',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL : 'file:test-libsql.db'
  }
});