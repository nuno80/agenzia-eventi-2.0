This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

This project includes a fully configured SQLite database using Drizzle ORM with two options:

1. **Better-SQLite3** (default) - High performance but requires native compilation
2. **LibSQL** (Windows-friendly alternative) - Pure JavaScript implementation

### Initial Setup

1. Install dependencies: `pnpm install`
2. For Windows users or environments without build tools, use the libsql implementation
3. For other environments, you can use the better-sqlite3 implementation

### Database Scripts

- `pnpm db:generate` - Generate migrations based on schema changes
- `pnpm db:migrate` - Apply migrations to the database
- `pnpm db:studio` - Open Drizzle Studio to inspect the database
- `pnpm db:seed` - Seed the database with sample data

### Usage

```typescript
// Using better-sqlite3 (default)
import { db, users } from '@/db';

// Using libsql (Windows-friendly alternative)
import { db, users } from '@/db/libsql';
```

For more details, see [Database Setup Guide](./guide/database-setup.md).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.