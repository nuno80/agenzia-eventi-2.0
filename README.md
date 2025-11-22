# Event Management Landing Page

This is a modern Next.js 16 application for an event management company, implementing best practices from the Next.js 15+ architecture guide. The application features a landing page for event services along with a complete file management system using Vercel Blob storage.

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables (see Environment Variables section)
cp .env.example .env.local
# Edit .env.local with your TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN

# 3. Push database schema to Turso
pnpm db:push

# 4. Seed database with sample data
pnpm db:seed

# 5. Start development server
pnpm dev
```

> **⚠️ Common Issue**: If you see "no such table" errors, make sure you've run `pnpm db:push` and restarted the dev server.

## 🚀 Key Features

### Modern Next.js Architecture

- **Server-First Architecture**: Components default to Server Components with Client Components only when necessary
- **Cache Components**: Next.js 16's implementation of Partial Pre-rendering for faster initial page loads
- **Server Actions**: Replaced traditional API routes for mutations with Server Actions
- **Data Access Layer (DAL)**: Centralized data access with proper server-only imports and security
- **Route Protection**: Proxy-based route protection for secure access control

### File Management System

- **Vercel Blob Integration**: Secure file uploads with Vercel Blob storage
- **Database Metadata**: File metadata stored in SQLite database via Drizzle ORM
- **File Operations**: Complete CRUD functionality (Create, Read, Update, Delete)
- **Validation**: File type and size validation (15MB limit)
- **Responsive UI**: Mobile-friendly file management interface

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **Database**: Turso (LibSQL) with Drizzle ORM
- **File Storage**: Vercel Blob
- **Authentication**: Placeholder system ready for Clerk integration
- **Deployment**: Vercel-ready configuration
- **Package Manager**: pnpm (REQUIRED - do not use npm or yarn)

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes (legacy, being replaced by Server Actions)
│   ├── files/          # File management pages
│   └── server-demo/    # Demonstration of modern architecture
├── components/         # React components
│   ├── landing/        # Landing page components
│   └── ui/             # Reusable UI components
├── data/               # Data Access Layer (DAL)
│   ├── files/          # File-related data operations
│   ├── users/          # User-related data operations
│   └── server-only.ts  # Authorization utilities
└── db/                 # Database configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18 or later
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual values
```

### Environment Variables

Create a `.env.local` file with:

```env
# Turso Database (REQUIRED)
TURSO_CONNECTION_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# Vercel Blob (required for file uploads)
BLOB_READ_WRITE_TOKEN=your_actual_vercel_blob_token_here
```

> **Important**: Make sure to use `TURSO_CONNECTION_URL` (not `TURSO_DATABASE_URL`)

### Database Setup

This project uses **Turso** (LibSQL) as the primary database. Follow these steps carefully to avoid common configuration issues.

#### 1. Environment Variables

Create a `.env.local` file with your Turso credentials:

```env
# Turso Database (REQUIRED)
TURSO_CONNECTION_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# Vercel Blob (required for file uploads)
BLOB_READ_WRITE_TOKEN=your_actual_vercel_blob_token_here
```

> **⚠️ IMPORTANT**: The environment variable must be named `TURSO_CONNECTION_URL` (not `TURSO_DATABASE_URL`). This matches the configuration in `src/db/libsql.ts` and `drizzle.config.ts`.

#### 2. Push Schema to Turso

After setting up your environment variables, push the database schema to Turso:

```bash
# This will create all tables in your Turso database
pnpm db:push
```

**What this does:**
- Reads your schema from `src/db/libsql-schemas/*.ts`
- Connects to Turso using credentials from `.env.local`
- Creates all tables (events, participants, speakers, sponsors, budget, etc.)

#### 3. Seed the Database

Populate your database with sample data:

```bash
# This will create sample events, participants, budget data, etc.
pnpm db:seed
```

**Sample data includes:**
- 4 Events (different statuses: draft, planning, open, ongoing)
- 10 Participants
- 4 Speakers
- 2 Sponsors
- 8 Deadlines
- 3 Budget Categories with 3 Budget Items
- 8 Staff members
- 2 Services

#### 4. View Database (Optional)

Open Drizzle Studio to view and manage your database:

```bash
pnpm db:studio
```

This will open a web interface at `http://localhost:4983` where you can browse tables and data.

### Troubleshooting Database Issues

#### Error: "no such table: events"

**Cause**: The application is connecting to a local SQLite file instead of Turso, or the schema hasn't been pushed to Turso.

**Solution**:
1. Verify `.env.local` has `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN`
2. Restart the dev server to pick up environment variables
3. Run `pnpm db:push` to ensure schema is in Turso
4. Run `pnpm db:seed` to populate data

#### Error: "TURSO_DATABASE_URL is not defined"

**Cause**: Incorrect environment variable name.

**Solution**: Use `TURSO_CONNECTION_URL` (not `TURSO_DATABASE_URL`) in `.env.local`

#### Error: "Uncached data was accessed outside of <Suspense>"

**Cause**: Data fetching happening outside Suspense boundaries in Next.js 16.

**Solution**: This has been fixed in the codebase. If you see this error in new pages, ensure async data fetching happens inside a component wrapped in `<Suspense>`.

### Making Schema Changes

When you modify the database schema:

1. **Update schema files** in `src/db/libsql-schemas/*.ts`
2. **Push changes to Turso**:
   ```bash
   pnpm db:push
   ```
3. **Restart dev server** to pick up changes:
   ```bash
   # Stop current server (Ctrl+C), then:
   pnpm dev
   ```

> **Note**: `db:push` is recommended for development. For production, use migrations with `pnpm db:generate` and `pnpm db:migrate`.

### Database Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm db:push` | Push schema changes to Turso (development) |
| `pnpm db:seed` | Populate database with sample data |
| `pnpm db:studio` | Open Drizzle Studio to view database |
| `pnpm db:generate` | Generate migration files from schema |
| `pnpm db:migrate` | Apply migrations to database |


### Development

```bash
# Start development server
pnpm dev

# Visit http://localhost:3000
```

## 🎨 Code Quality Tools

### Biome.js

This project uses [Biome.js](https://biomejs.dev/) for code formatting and linting. Biome is a fast formatter and linter that replaces Prettier and ESLint with a single tool.

### Code Quality

Questo progetto usa [Biome](https://biomejs.dev/) per linting e formatting.

**Comandi utili:**

- `pnpm run check` - Verifica errori
- `pnpm run check:fix` - Corregge automaticamente
- `pnpm run format` - Formatta tutto
- `pnpm run clean:imports` - Rimuove import inutilizzati
- `pnpm check:fix:unsafe` - Fix unsafe rules. USA PRIMA QUESTO!!!

**Pre-commit hook:**
Il codice viene automaticamente formattato prima di ogni commit tramite Husky + lint-staged.

#### VS Code Integration

The project includes VS Code settings that configure Biome as the default formatter:

- Format on save is enabled
- Automatic import organization
- Quick fixes on save

To use Biome in VS Code:

1. Install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
2. Ensure "Biome" is set as the default formatter in VS Code settings

### Pre-commit Hooks

This project uses [Husky](https://typicode.github.io/husky/) to run pre-commit hooks that ensure code quality:

- **Format Check**: Before each commit, the project runs `npm run format:check` to ensure all files are properly formatted
- **Prevents Unformatted Code**: This prevents unformatted code from being committed to the repository

The pre-commit hook is automatically set up when you install dependencies. You can modify the hook in `.husky/pre-commit`.

## 📤 File Upload Features

### Supported File Types

- Images: JPG, PNG, WebP, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX
- Maximum size: 15MB

### API Endpoints

- `POST /api/files` - Upload a file
- `GET /api/files/list` - List all files
- `DELETE /api/files/[id]` - Delete a file

### UI Components

- `FileUploader` - Drag-and-drop file upload with validation
- `FileList` - Responsive table of uploaded files
- `FileManager` - Tabbed interface combining upload and list views

## 🏗️ Modern Architecture Implementation

### Data Access Layer (DAL)

Centralized data operations in `src/data/`:

- Server-only imports prevent client-side leakage
- React.cache() deduplication for authorization functions
- Consistent error handling and return formats
- Type-safe database operations with Drizzle ORM

### Component Architecture

- Server Components by default for better performance
- Client Components only where interactivity is needed
- "Pass the Promise" pattern for optimized data fetching
- Suspense boundaries with loading skeletons

### Server Actions

- Replace API routes for mutations
- Built-in validation and error handling
- Cache invalidation with revalidatePath()
- Serializable return values for client consumption

## 🛡️ Security Features

- Server-only data access prevents credential leakage
- File type and size validation
- Authorization checks at the data access layer
- Route protection via proxy middleware
- Secure Vercel Blob storage with random suffixes

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive file management interface
- Accessible UI components
- Optimized performance for all devices

## 🚀 Deployment

The application is configured for easy deployment to Vercel:

1. Push to a GitHub repository
2. Import project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## 📚 Additional Documentation

- [Vercel Blob Implementation Guide](./README-VERCEL-BLOB.md) - Detailed file upload system documentation
- [Database Setup Guide](./guide/database-setup.md) - Database configuration and management
- [Next.js 15 Alignment Summary](./NEXTJS15_ALIGNMENT_SUMMARY.md) - Modernization implementation details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary software developed for a specific client.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Database management with [Drizzle ORM](https://orm.drizzle.team)
- File storage with [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
