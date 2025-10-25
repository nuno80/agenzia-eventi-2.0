# Database Setup with Drizzle ORM and Better-SQLite3

This guide explains how to use the database setup in this Next.js project.

## Project Structure

```
src/
  db/
    index.ts          # Database initialization (better-sqlite3)
    libsql.ts         # Alternative database initialization (libsql)
    schemas/          # Database schemas
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

## Windows Installation Issues

On Windows, you might encounter issues when installing `better-sqlite3` due to missing build tools. The error typically looks like:

```
Error: Could not locate the bindings file
```

This happens because `better-sqlite3` requires native compilation, which needs:
1. Python (✓ You have this)
2. Visual Studio with C++ development tools (✗ Missing)

### Solution Options:

1. **Install Visual Studio Build Tools**:
   - Download and install "Microsoft Visual Studio Build Tools"
   - Make sure to include the "C++ build tools" workload
   - Then run: `pnpm install` or `npm rebuild better-sqlite3`

2. **Use prebuilt binaries** (if available):
   - Try: `pnpm add better-sqlite3 --force`

3. **Alternative: Use libSQL with Drizzle** (recommended for development):
   - Already installed: `@libsql/client`
   - This uses a pure JavaScript SQLite implementation that works without compilation
   - Import from `@/db/libsql` instead of `@/db`

## Usage Examples

### 1. Querying Data

```typescript
// Using better-sqlite3 (default)
import { db, users } from '@/db';

// Using libsql (Windows-friendly alternative)
import { db, users } from '@/db/libsql';

// Get all users
const allUsers = await db.select().from(users);

// Get a specific user
const user = await db.select().from(users).where(eq(users.id, 1));
```

### 2. Inserting Data

```typescript
import { db, users } from '@/db'; // or '@/db/libsql'

// Insert a new user
const newUser = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com'
}).returning();
```

### 3. Updating Data

```typescript
import { db, users } from '@/db'; // or '@/db/libsql'
import { eq } from 'drizzle-orm';

// Update a user
const updatedUser = await db.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, 1))
  .returning();
```

### 4. Deleting Data

```typescript
import { db, users } from '@/db'; // or '@/db/libsql'
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

The API routes automatically fallback to the libsql implementation if better-sqlite3 is not available.

## Schema Definition

Schemas are defined using Drizzle ORM's schema builder. See `src/db/schemas/users.ts` for an example:

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

1. Create a new schema file in `src/db/schemas/`
2. Define your table using Drizzle's schema builder
3. Export the schema in `src/db/schemas/index.ts`
4. Run `pnpm db:generate` to create migrations
5. Run `pnpm db:migrate` to apply the migrations