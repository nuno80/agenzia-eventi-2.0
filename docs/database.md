# Guida Completa: Turso + Drizzle per Next.js

> **Per chi è questa guida**: Sviluppatori che vogliono aggiungere un database veloce e gratuito al loro progetto Next.js (blog, dashboard, app eventi, ecc.)

## 📋 Indice

1. [Cosa sono Turso e Drizzle](#1-cosa-sono-turso-e-drizzle)
2. [Prerequisiti](#2-prerequisiti)
3. [Setup Turso (Database)](#3-setup-turso-database)
4. [Setup Drizzle (ORM)](#4-setup-drizzle-orm)
5. [Creare lo Schema del Database](#5-creare-lo-schema-del-database)
6. [Configurare il Database Client](#6-configurare-il-database-client)
7. [Eseguire le Migrations](#7-eseguire-le-migrations)
8. [Operazioni CRUD Base](#8-operazioni-crud-base)
9. [Integrare con Clerk (Auth)](#9-integrare-con-clerk-auth)
10. [Deploy su Vercel](#10-deploy-su-vercel)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Cosa sono Turso e Drizzle

### **Turso**
- Database SQL (SQLite) distribuito globalmente su edge
- **Gratis fino a 9GB** di storage
- Velocissimo: risponde in 10-50ms da qualsiasi parte del mondo
- Zero configurazione server

### **Drizzle**
- ORM (Object-Relational Mapper) TypeScript-first
- Leggero (~30KB vs 500KB di Prisma)
- Type-safe: previene errori a compile-time
- Supporto nativo per Turso

### **Perché usarli insieme?**
- Stack moderno, veloce, gratuito
- Perfetto per progetti Next.js su Vercel
- Ottimo per: blog, dashboard, CRUD apps, eventi, e-commerce piccoli

---

## 2. Prerequisiti

### **Software necessario:**
```bash
✅ Node.js 18+ installato
✅ npm o pnpm installato
✅ Un progetto Next.js esistente (App Router)
✅ Git installato (opzionale ma consigliato)
```

### **Verifica installazioni:**
```bash
node --version    # deve essere >= 18
npm --version     # qualsiasi versione recente
```

### **Se non hai un progetto Next.js:**
```bash
npx create-next-app@latest my-app
cd my-app
```

---

## 3. Setup Turso (Database)

### **Passo 1: Installa Turso CLI**

**Su macOS/Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

**Su Windows (PowerShell):**
```powershell
irm get.tur.so/install.ps1 | iex
```

**Verifica installazione:**
```bash
turso --version
```

### **Passo 2: Crea un account Turso**

```bash
turso auth signup
```

Questo aprirà il browser per completare la registrazione. Puoi usare:
- Email + password
- GitHub
- Google

### **Passo 3: Crea il tuo database**

```bash
# Sostituisci "my-app-db" con il nome che preferisci
turso db create my-app-db
```

Output:
```
Created database my-app-db in Rome, Italy (ams) in 2 seconds.
```

### **Passo 4: Ottieni le credenziali**

```bash
turso db show my-app-db
```

Output simile a:
```
Name:           my-app-db
URL:            libsql://my-app-db-username.turso.io
Locations:      ams (primary)
```

### **Passo 5: Crea un token di accesso**

```bash
turso db tokens create my-app-db
```

Output:
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**: Copia questo token, lo userai nel file `.env`

### **Passo 6: Salva le credenziali**

Nel tuo progetto Next.js, crea/modifica il file `.env.local`:

```bash
# .env.local
TURSO_DATABASE_URL="libsql://my-app-db-username.turso.io"
TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."
```

⚠️ **SICUREZZA**: Aggiungi `.env.local` al `.gitignore`!

```bash
# .gitignore
.env.local
```

---

## 4. Setup Drizzle (ORM)

### **Passo 1: Installa le dipendenze**

```bash
npm install drizzle-orm @libsql/client
npm install -D drizzle-kit
```

**Cosa abbiamo installato:**
- `drizzle-orm`: il core di Drizzle
- `@libsql/client`: client per connettersi a Turso
- `drizzle-kit`: tool per migrations e studio (dev dependency)

### **Passo 2: Configura Drizzle**

Crea il file `drizzle.config.ts` nella root del progetto:

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  }
})
```

**Spiegazione:**
- `schema`: dove definirai le tabelle
- `out`: cartella per le migrations
- `dialect`: tipo di database (SQLite per Turso)
- `driver`: usa il driver Turso
- `dbCredentials`: legge da `.env.local`

### **Passo 3: Aggiungi script a package.json**

Apri `package.json` e aggiungi questi script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Cosa fanno:**
- `db:generate`: crea file migration da schema
- `db:push`: applica schema a database
- `db:studio`: apre interfaccia visuale per vedere dati

---

## 5. Creare lo Schema del Database

### **Passo 1: Crea la struttura cartelle**

```bash
mkdir -p lib/db
```

### **Passo 2: Crea file schema**

Crea il file `lib/db/schema.ts`:

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Tabella Users
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// Tabella Posts (per il blog)
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  published: integer('published', { mode: 'boolean' })
    .default(false)
    .notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// Tabella Events (per la dashboard)
export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  maxAttendees: integer('max_attendees'),
  organizerId: text('organizer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// Tabella Attendees (chi partecipa agli eventi)
export const attendees = sqliteTable('attendees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] })
    .default('pending')
    .notNull(),
  registeredAt: integer('registered_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// Types TypeScript (inferiti automaticamente)
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

export type Attendee = typeof attendees.$inferSelect
export type NewAttendee = typeof attendees.$inferInsert
```

### **Spiegazione Schema:**

**Tipi di colonna:**
- `text('name')`: stringa (VARCHAR)
- `integer('age')`: numero intero
- `integer('date', { mode: 'timestamp' })`: data/ora

**Modificatori:**
- `.primaryKey()`: chiave primaria
- `.notNull()`: non può essere NULL
- `.unique()`: valore deve essere unico
- `.default(value)`: valore di default
- `.references(() => table.column)`: foreign key

**Relazioni:**
- Un post appartiene a un user (authorId)
- Un evento appartiene a un user (organizerId)
- Un attendee collega user ed event (many-to-many)

---

## 6. Configurare il Database Client

### **Crea il file client**

Crea `lib/db/index.ts`:

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

// Crea connessione a Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
})

// Esporta database con schema
export const db = drizzle(client, { schema })

// Esporta anche lo schema per usarlo altrove
export * from './schema'
```

**Questo file:**
- Crea la connessione a Turso
- Esporta `db` che userai ovunque per fare query
- Esporta anche lo schema per avere i types

---

## 7. Eseguire le Migrations

### **Passo 1: Genera migration**

```bash
npm run db:generate
```

Output:
```
✓ Generated migrations in ./drizzle folder
```

Questo crea file SQL nella cartella `drizzle/` basati sul tuo schema.

### **Passo 2: Applica migration al database**

```bash
npm run db:push
```

Output:
```
✓ Pushed schema to database
✓ Created table: users
✓ Created table: posts
✓ Created table: events
✓ Created table: attendees
```

### **Passo 3: Verifica con Drizzle Studio**

```bash
npm run db:studio
```

Questo apre `https://local.drizzle.studio` nel browser dove puoi:
- Vedere tutte le tabelle
- Vedere i dati
- Inserire dati manualmente per testare

---

## 8. Operazioni CRUD Base

### **Esempio: API Route per Posts**

Crea `app/api/posts/route.ts`:

```typescript
// app/api/posts/route.ts
import { NextResponse } from 'next/server'
import { db, posts } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

// GET: Ottieni tutti i post pubblicati
export async function GET() {
  try {
    const allPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.publishedAt))

    return NextResponse.json(allPosts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST: Crea nuovo post
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, content, excerpt, authorId, slug } = body

    // Validazione base
    if (!title || !content || !authorId || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Inserisci post
    const newPost = await db
      .insert(posts)
      .values({
        title,
        content,
        excerpt,
        authorId,
        slug,
        published: false
      })
      .returning()

    return NextResponse.json(newPost[0], { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
```

### **Esempio: API Route per Events**

Crea `app/api/events/route.ts`:

```typescript
// app/api/events/route.ts
import { NextResponse } from 'next/server'
import { db, events } from '@/lib/db'
import { eq, gte, desc } from 'drizzle-orm'

// GET: Eventi futuri
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const organizerId = searchParams.get('organizerId')

    let query = db
      .select()
      .from(events)
      .where(gte(events.date, new Date()))
      .orderBy(desc(events.date))

    // Filtra per organizzatore se specificato
    if (organizerId) {
      query = query.where(eq(events.organizerId, organizerId))
    }

    const upcomingEvents = await query

    return NextResponse.json(upcomingEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST: Crea evento
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, location, date, organizerId, maxAttendees } = body

    if (!title || !date || !organizerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newEvent = await db
      .insert(events)
      .values({
        title,
        description,
        location,
        date: new Date(date),
        organizerId,
        maxAttendees
      })
      .returning()

    return NextResponse.json(newEvent[0], { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
```

### **Esempio: Server Component che usa il DB**

Crea `app/blog/page.tsx`:

```typescript
// app/blog/page.tsx
import { db, posts } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function BlogPage() {
  // Query diretta nel Server Component
  const publishedPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      <div className="grid gap-6">
        {publishedPosts.map((post) => (
          <article key={post.id} className="border rounded-lg p-6">
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600">
                {post.title}
              </h2>
            </Link>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <time className="text-sm text-gray-500">
              {post.publishedAt?.toLocaleDateString()}
            </time>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### **Operazioni CRUD Complete**

```typescript
// Esempi di tutte le operazioni

// CREATE - Inserisci
const newUser = await db.insert(users).values({
  id: 'user_123',
  clerkId: 'clerk_abc',
  email: 'user@example.com',
  name: 'Mario Rossi'
}).returning()

// READ - Leggi uno
const user = await db.select()
  .from(users)
  .where(eq(users.id, 'user_123'))
  .limit(1)

// READ - Leggi molti con filtri
const filteredPosts = await db.select()
  .from(posts)
  .where(
    and(
      eq(posts.published, true),
      gte(posts.publishedAt, new Date('2025-01-01'))
    )
  )
  .orderBy(desc(posts.publishedAt))
  .limit(10)

// UPDATE - Aggiorna
await db.update(posts)
  .set({ 
    title: 'Titolo Aggiornato',
    updatedAt: new Date()
  })
  .where(eq(posts.id, 1))

// DELETE - Elimina
await db.delete(posts)
  .where(eq(posts.id, 1))

// JOIN - Unisci tabelle
const postsWithAuthors = await db.select({
  post: posts,
  author: users
})
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true))
```

---

## 9. Integrare con Clerk (Auth)

### **Passo 1: Installa Clerk**

```bash
npm install @clerk/nextjs
```

### **Passo 2: Setup Clerk**

Vai su [clerk.com](https://clerk.com), crea un account e un'app.

Aggiungi le chiavi a `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
```

### **Passo 3: Configura Clerk in Next.js**

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/blog(.*)',
  '/api/posts',
  '/sign-in(.*)',
  '/sign-up(.*)'
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
}
```

### **Passo 4: Crea user nel DB dopo signup**

Crea `app/api/webhooks/clerk/route.ts`:

```typescript
// app/api/webhooks/clerk/route.ts
import { NextResponse } from 'next/server'
import { db, users } from '@/lib/db'
import { Webhook } from 'svix'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  // Ottieni headers
  const headerPayload = req.headers
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing headers', { status: 400 })
  }

  // Ottieni body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verifica webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: any

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new NextResponse('Error: Verification failed', { status: 400 })
  }

  // Gestisci evento
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    // Crea user nel database
    await db.insert(users).values({
      id: `user_${Date.now()}`,
      clerkId: id,
      email: email_addresses[0].email_address,
      name: `${first_name || ''} ${last_name || ''}`.trim() || null,
      avatarUrl: image_url || null
    })
  }

  return NextResponse.json({ message: 'Webhook received' })
}
```

### **Passo 5: Configura Webhook in Clerk Dashboard**

1. Vai su Clerk Dashboard → Webhooks
2. Clicca "Add Endpoint"
3. URL: `https://tuo-dominio.vercel.app/api/webhooks/clerk`
4. Seleziona evento: `user.created`
5. Copia "Signing Secret" e aggiungilo a `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_...
```

### **Passo 6: Usa Auth nelle API Routes**

```typescript
// app/api/events/route.ts
import { auth } from '@clerk/nextjs/server'
import { db, events, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  // Ottieni user ID da Clerk
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Trova user nel database
  const user = await db.select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1)

  if (!user[0]) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await req.json()

  // Crea evento con l'ID del user
  const newEvent = await db.insert(events).values({
    ...body,
    organizerId: user[0].id
  }).returning()

  return NextResponse.json(newEvent[0])
}
```

---

## 10. Deploy su Vercel

### **Passo 1: Push su GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tuo-username/tuo-repo.git
git push -u origin main
```

### **Passo 2: Importa su Vercel**

1. Vai su [vercel.com](https://vercel.com)
2. Clicca "New Project"
3. Importa il tuo repo GitHub
4. Aggiungi Environment Variables:

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=eyJ...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
```

5. Clicca "Deploy"

### **Passo 3: Verifica deployment**

Dopo il deploy:
- Vai su `https://tuo-progetto.vercel.app`
- Testa login/signup
- Verifica che i dati si salvino correttamente

---

## 11. Troubleshooting

### **Errore: "Cannot find module '@libsql/client'"**

```bash
# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install
```

### **Errore: "TURSO_DATABASE_URL is not defined"**

Verifica:
1. File `.env.local` esiste nella root
2. Variabili sono scritte correttamente (nessuno spazio extra)
3. Riavvia server di sviluppo: `npm run dev`

### **Errore: "relation does not exist"**

Le tabelle non esistono nel database. Esegui:

```bash
npm run db:push
```

### **Errore 401 su webhook Clerk**

1. Verifica che `CLERK_WEBHOOK_SECRET` sia in `.env.local` E in Vercel
2. Controlla che l'URL del webhook sia corretto
3. Verifica che svix headers siano presenti

### **Database lento?**

Turso usa edge locations. Verifica la region:

```bash
turso db show my-app-db
```

Se necessario, crea replica più vicina:

```bash
turso db replicate my-app-db rome
```

### **Come vedere i log del database?**

```bash
# Apri Drizzle Studio
npm run db:studio

# Oppure usa Turso CLI
turso db shell my-app-db
```

---

## 🎉 Complimenti!

Ora hai:
- ✅ Database Turso configurato e funzionante
- ✅ Drizzle ORM per query type-safe
- ✅ Schema completo (users, posts, events, attendees)
- ✅ API Routes per CRUD
- ✅ Integrazione Clerk per auth
- ✅ Deploy su Vercel

## 📚 Risorse Utili

- [Documentazione Turso](https://docs.turso.tech)
- [Documentazione Drizzle](https://orm.drizzle.team)
- [Esempi Drizzle](https://github.com/drizzle-team/drizzle-orm/tree/main/examples)
- [Clerk Docs](https://clerk.com/docs)

## 🚀 Prossimi Passi

1. Aggiungi validazione con Zod
2. Implementa paginazione per liste lunghe
3. Aggiungi cache con React Query
4. Implementa search con full-text search
5. Aggiungi upload immagini con Vercel Blob

Buon coding! 🎯