# 🚀 Next.js 16 Starter Kit

> Production-ready Next.js 16 starter kit with Better Auth, Drizzle ORM, Vercel Blob, and modern tooling.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4)](https://tailwindcss.com)

## ⚡ Quick Start

```bash
# 1. Clone and install
git clone <repo-url> my-app
cd my-app
pnpm install

# 2. Configure environment
cp .env.local.exemple .env.local
# Edit .env.local with your credentials
# See docs/environment-setup.md for detailed instructions

# 3. Push database schema
pnpm db:push

# 4. Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **UI** | React 19, Tailwind CSS v4, shadcn/ui |
| **Database** | Turso (LibSQL) + Drizzle ORM |
| **Auth** | Better Auth (email + Google OAuth) |
| **File Storage** | Vercel Blob |
| **Email** | Resend |
| **Forms** | react-hook-form + Zod |
| **Code Quality** | Biome + Husky |
| **Package Manager** | pnpm (required) |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard
│   │   ├── dashboard/     # Home page
│   │   ├── files/         # File management (Vercel Blob)
│   │   └── impostazioni/  # Settings
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── landing/           # Landing page components
│   └── dashboard/         # Dashboard components
├── lib/
│   ├── auth.ts            # Better Auth configuration
│   ├── config.ts          # App configuration (auth opt-in)
│   ├── dal/               # Data Access Layer
│   └── validations/       # Zod schemas
└── db/
    ├── libsql.ts          # Database connection
    └── libsql-schemas/    # Drizzle schemas
```

---

## 🔐 Authentication (Opt-in)

This starter includes **Better Auth** pre-configured but **disabled by default** for easier development and testing.

### Enable Authentication

1. Configure `.env.local` with auth credentials ([see guide](./docs/environment-setup.md))
2. Set `auth.enabled: true` in `src/lib/config.ts`
3. Run `pnpm db:push` to create auth tables
4. Restart the dev server

### Features

- Email/password authentication
- Google OAuth
- Session management with cookie caching
- Role-based access (user/admin)

---

## 🗄️ Database

Uses [Turso](https://turso.tech/) (edge SQLite) with [Drizzle ORM](https://orm.drizzle.team/).

### Commands

```bash
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed with sample data
```

---

## 📤 File Storage

Built-in file management with [Vercel Blob](https://vercel.com/docs/storage/vercel-blob):

- Drag & drop upload
- File type validation
- Size limits (15MB)
- Database metadata storage

Access at `/files` in the dashboard.

---

## ✅ Code Quality

### Biome (Linting + Formatting)

```bash
pnpm check        # Run all checks
pnpm check:fix    # Auto-fix issues
pnpm format       # Format code
pnpm clean:imports # Remove unused imports
```

### Pre-commit Hooks (Husky)

Automatically runs checks before each commit.

---

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm check` | Run all code quality checks |
| `pnpm check:fix` | Auto-fix code issues |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |

---

## 🚀 Deployment

Ready for [Vercel](https://vercel.com/) deployment:

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

---

## 📚 Documentation

- [Environment Setup](./docs/environment-setup.md) - How to get all credentials
- [Database Guide](./docs/database.md) - Drizzle + Turso
- [Authentication](./docs/authentication.md) - Better Auth setup
- [Next.js 16 Reference](./docs/nextjs16-reference.md) - Core concepts

---

## 📄 License

MIT
