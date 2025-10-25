# Database Setup with Drizzle ORM and Turso

This guide explains how to use the database setup in this Next.js project, which now uses Turso as the backend database.

## Project Structure

```
src/
  db/
    index.ts          # Database initialization (redirects to libsql)
    libsql.ts         # Turso database initialization (libsql)
    libsql-schemas/   # Database schemas for Turso
      index.ts        # Export all schemas
      users.ts        # User schema example
    seed.ts           # Database seeding script
    test.ts           # Database testing script
drizzle.config.ts     # Drizzle configuration
```

## Available Scripts

- `pnpm db:generate` - Generate migrations based on schema changes
- `pnpm db:migrate` - Apply migrations to the database
- `pnpm db:studio` - Open Drizzle Studio to inspect the database
- `pnpm db:seed` - Seed the database with sample data

## Database Setup

This project now uses Turso as its database backend through the libsql client. All better-sqlite3 dependencies and code have been removed to avoid confusion.

### Prerequisites

1. Create a Turso account at [turso.tech](https://turso.tech)
2. Create a database using the Turso CLI:
   ```bash
   turso db create my-app-db
   ```
3. Get your database URL:
   ```bash
   turso db show --url my-app-db
   ```
4. Create an authentication token:
   ```bash
   turso db tokens create my-app-db
   ```

### Environment Configuration

Add your Turso credentials to `.env.local`:

```bash
TURSO_DATABASE_URL=libsql://my-app-db-username.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

## Usage Examples

### 1. Querying Data

```typescript
// Using Turso database (libsql implementation)
import { db, users } from '@/db';

// Get all users
const allUsers = await db.select().from(users);

// Get a specific user
const user = await db.select().from(users).where(eq(users.id, 1));
```

### 2. Inserting Data

```typescript
import { db, users } from '@/db';

// Insert a new user
const newUser = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com'
}).returning();
```

### 3. Updating Data

```typescript
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

// Update a user
const updatedUser = await db.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, 1))
  .returning();
```

### 4. Deleting Data

```typescript
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

// Delete a user
const deletedUser = await db.delete(users)
  .where(eq(users.id, 1))
  .returning();
```

## API Routes

The project includes example API routes in `src/app/api/users/route.ts` that demonstrate:

- GET `/api/users` - Get all users
- POST `/api/users` - Create a new user
- DELETE `/api/users/[id]` - Delete a user

These routes now use only the Turso/libsql implementation.

## Schema Definition

Schemas are defined using Drizzle ORM's schema builder. See `src/db/libsql-schemas/users.ts` for an example:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});
```

## Adding New Tables

1. Create a new schema file in `src/db/libsql-schemas/`
2. Define your table using Drizzle's schema builder
3. Export the schema in `src/db/libsql-schemas/index.ts`
4. Run `pnpm db:generate` to create migrations
5. Run `pnpm db:migrate` to apply the migrations