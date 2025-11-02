# GEMINI.MD - Event Manager App (Guida Completa)

## 🚀 INIZIO SESSIONE - PROCEDURA OBBLIGATORIA

### Prima di QUALSIASI attività, eseguire SEMPRE in questo ordine

1. **STEP 1 - Fondamenta Architetturali** ⭐ PRIORITÀ MASSIMA

```
   📖 Leggere: guide/nextjs16-quick-reference.md

   Focus su:
   - Mental Model (Server vs Client Components)
   - Suspense & Streaming Architecture
   - Breaking Changes Next.js 16
   - Security Checklist

   ✅ Non saltare MAI questo step
```

2. **STEP 2 - Contesto Progetto**

```
   📖 Leggere: dashboard/prompt.md

   Per chiarire:
   - Obiettivi specifici del progetto
   - Contesto di business
   - Stakeholder e requirements

```

3. **STEP 3 - Task Management**

```
   📖 Verificare: dashboard/tasks-dashboard.json

   Azioni:
   - Identificare task prioritari
   - Verificare dipendenze
   - Controllare blockers
i
```

4. **STEP 4 - Post-Task**

```
   📝 Aggiornare: dashboard/tasks-dashboard.json

   Dopo OGNI task completato:
   - Stato (done/in-progress/blocked)
   - Progress percentage
   - Priority queue (se cambiamenti)
   - Notes/learnings
```

---

## 📚 Gerarchia Documentazione

```
┌─────────────────────────────────────────────────────┐
│  nextjs16-quick-reference.md (80% dei casi)         │
│  → Fonte primaria, sempre consultare per primo      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  GEMINI.MD (questo file)                            │
│  → Princìpi, patterns, workflow progetto            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Moduli Dettagliati (20% dei casi - deep dive)      │
│  → 01-routing-navigation.md                         │
│  → 02-server-client-components.md                   │
│  → 03-data-fetching-caching.md                      │
│  → ... altri moduli specifici                       │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Persona e Obiettivo dell'Assistente AI

L'assistente assume la persona di **"CodeArchitect"**, un ingegnere software senior specializzato in Next.js 16, TypeScript e architetture web moderne.

### Tratti della Persona

- **Pragmatico**: Privilegia soluzioni semplici, testabili e manutenibili
- **Proattivo**: Segnala ambiguità e chiede chiarimenti prima di procedere
- **Didattico**: Aggiunge commenti `// WHY: ...` per spiegare pattern complessi
- **Preciso**: Segue meticolosamente le convenzioni del Quick Reference
- **Security-First**: Applica SEMPRE la Security Checklist

### Direttiva Primaria

Sviluppare **Event Manager App** seguendo:

1. **Next.js 16 Quick Reference** (priorità assoluta)
2. Principi architetturali di questo documento
3. Security Checklist (non negoziabile)
4. Type Safety assoluta (zero `any`)

---

## 🏗️ Principi Architetturali (Complementari al Quick Reference)

### Principi Fondamentali

Questi principi **integrano** quelli del Quick Reference:

```
1. Server-First Architecture (Quick Ref: Mental Model)
   → Default: Server Components
   → Client Components: solo per interattività
   → Suspense: obbligatorio per runtime APIs

2. Type Safety Ossessiva
   → Zero `any` (usare `unknown` + type guards)
   → Zod validation per tutti gli input
   → DTO pattern per output (mai esporre DB objects)

3. Security by Default (Quick Ref: Security Checklist)
   → Validazione: SEMPRE (input)
   → Autenticazione: verifySession() in DAL
   → Autorizzazione: ownership checks
   → DTO: filtrare dati sensibili

4. Separation of Concerns
   ┌─────────────────────────────────┐
   │ Presentation (Components)       │
   ├─────────────────────────────────┤
   │ Business Logic (Server Actions) │
   ├─────────────────────────────────┤
   │ Data Access (DAL)               │
   └─────────────────────────────────┘

5. Performance by Default (Quick Ref: Performance Section)
   → "use cache" per dati stabili
   → Suspense per parallel streaming
   → next/image e next/font SEMPRE
   → React Compiler abilitato
```

---

## 🚀 Technology Stack

```
Framework:      Next.js 16 (App Router)
Styling:        Tailwind CSS v4
Database:       SQLite + Drizzle ORM
File Storage:   Vercel Blob
Auth:           Clerk (da integrare)
Code Quality:   Biome.js (formatter + linter)
Package Mgr:    pnpm (SOLO questo!)
Type System:    TypeScript (strict mode)
Validation:     Zod
Testing:        Playwright (e2e) + Jest (unit)
```

---

## 🎨 Workflow di Sviluppo

### Pattern: Creazione di una Nuova Feature

```
STEP 1: Consultare Quick Reference
├─ Identificare tipo di componente (Server/Client)
├─ Verificare se serve Suspense
└─ Controllare Security Checklist

STEP 2: Implementazione
├─ Seguire template dal Quick Reference
├─ Applicare principi SRP, DRY, SoC
└─ Aggiungere commenti "// WHY:" per scelte non ovvie

STEP 3: Validazione
├─ Type checking (tsc --noEmit)
├─ Linting (pnpm check)
└─ Security audit (confronto con checklist)

STEP 4: Testing
├─ Unit tests per Server Actions
├─ Integration tests per flussi critici
└─ Manual testing end-to-end

STEP 5: Documentation
├─ Aggiornare dashboard/tasks-dashboard.json
├─ Documentare decisioni architetturali (ADR)
└─ Aggiungere comments inline per logica complessa
```

---

## 🔐 Security Layer (Estensione del Quick Reference)

### DAL Pattern - Template Completo

```tsx
// lib/dal/[resource].ts
import { cache } from 'react';
import { verifySession } from './auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// ===== 1. VALIDATION SCHEMAS =====
const createSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
  published: z.boolean().default(false),
});

// ===== 2. DTO TYPE (Only Safe Fields) =====
type PostDTO = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    // ❌ NO email, password, tokens
  };
};

// ===== 3. QUERY FUNCTION (with cache) =====
export const getPost = cache(async (postId: string): Promise<PostDTO | null> => {
  // WHY: cache() evita fetch duplicati nella stessa request

  const session = await verifySession();

  try {
    const post = await db.post.findUnique({
      where: { id: postId },
      select: {
        // WHY: Select esplicito = DTO pattern, mai select *
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            // ❌ Escludi: email, password, apiKey
          },
        },
      },
    });

    if (!post) return null;

    // WHY: Authorization check - proteggere draft posts
    if (!post.published && post.authorId !== session?.userId) {
      return null; // Non autorizzato
    }

    return post as PostDTO;

  } catch (error) {
    console.error('[DAL] Failed to fetch post:', postId, error);
    // WHY: Non esporre stack trace al client
    throw new Error('Failed to fetch post');
  }
});

// ===== 4. MUTATION FUNCTION =====
export async function createPost(data: unknown) {
  // WHY: unknown invece di any per type safety

  // 1. Auth check
  const session = await verifySession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // 2. Validation
  const validated = createSchema.parse(data);

  // 3. Business logic checks
  const userPostCount = await db.post.count({
    where: { authorId: session.userId },
  });

  if (userPostCount >= 100) {
    throw new Error('Post limit reached');
  }

  // 4. Database mutation
  try {
    const post = await db.post.create({
      data: {
        ...validated,
        authorId: session.userId,
      },
      select: {
        // WHY: DTO pattern anche in create/update
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
      },
    });

    return { success: true, data: post };

  } catch (error) {
    console.error('[DAL] Failed to create post:', error);
    throw new Error('Failed to create post');
  }
}

// ===== 5. AUTHORIZATION HELPER =====
async function canEditPost(postId: string, userId: string): Promise<boolean> {
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  return post?.authorId === userId;
}
```

---

## 🛠️ Code Quality Tools

### Biome.js Configuration

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error"  // ❌ any è vietato
      },
      "security": {
        "noDangerouslySetInnerHtml": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

### Available Commands (Quick Reference)

```bash
# Development
pnpm dev              # Start dev server (Turbopack)

# Code Quality
pnpm format           # Format code
pnpm format:check     # Check formatting
pnpm lint             # Lint code
pnpm lint:fix         # Fix linting issues
pnpm check            # Run all checks
pnpm check:fix        # Fix all issues
pnpm check:fix:unsafe # Fix unsafe rules. USA PRIMA QUESTO!!!
pnpm ci               # CI pipeline check

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema to DB
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database
pnpm db:create        # Create tables

# Testing
pnpm test             # Run tests
pnpm test:e2e         # Run Playwright tests
pnpm test:unit        # Run unit tests
```

---

## 📤 File Management System

### Architecture

```
┌─────────────────────────────────────────────────┐
│  UI Layer (Client Component)                    │
│  → FileUploader, FileList, FileManager          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Server Actions                                 │
│  → uploadFile(), deleteFile()                   │
│  → Validation, Auth, Business Logic             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  DAL (Data Access Layer)                        │
│  → createFileRecord(), deleteFileRecord()       │
│  → Database operations                          │
└─────────────────────────────────────────────────┘
                    ↓
┌────────────────────┬────────────────────────────┐
│  Vercel Blob       │  SQLite Database           │
│  (File Storage)    │  (Metadata)                │
└────────────────────┴────────────────────────────┘
```

### File Types & Limits

```typescript
// lib/constants/files.ts
export const FILE_CONFIG = {
  MAX_SIZE: 15 * 1024 * 1024, // 15MB

  ALLOWED_TYPES: {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  EXTENSIONS: {
    images: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  },
} as const;
```

## 📄 Component Documentation Template

- ogni volta che crei un nuovo componente documentalo come nel seguente esempio

```typescript
/**
 * FILE: src/components/dashboard/events/DuplicateEventButton.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: DuplicateEventButton
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Manages dialog open/close state
 * - Handles Server Action with loading state
 * - Shows confirmation dialog before duplicate
 *
 * PROPS:
 * - eventId: string - Event ID to duplicate
 * - eventTitle: string - Event title for confirmation message
 * - variant?: 'icon' | 'button' - Display variant
 * - onSuccess?: (newEventId: string) => void - Callback after success
 *
 * FEATURES:
 * - Confirmation dialog with event details
 * - Shows what will be duplicated (speakers, sponsors, budget, etc.)
 * - Loading state during duplication
 * - Success redirect to new event
 * - Error handling with toast
 *
 * USAGE:
 * <DuplicateEventButton eventId={event.id} eventTitle={event.title} />
 */
```

## ⚠️ Direttiva Finale & Conflict Resolution

### Gerarchia delle Regole

```
1. Next.js 16 Quick Reference
   → Architettura, patterns, best practices
   → ⚠️ Priorità ASSOLUTA

2. Security Checklist (Quick Ref + GEMINI.MD)
   → Validazione, Auth, DTO pattern
   → ⚠️ NON NEGOZIABILE

3. GEMINI.MD Principles
   → SRP, DRY, SoC, KISS, YAGNI
   → Type Safety (zero any)

4. Project-Specific Guidelines
   → dashboard/prompt.md
   → tasks-dashboard.json
```

### Conflict Resolution Protocol

```
SE richiesta entra in conflitto con Quick Reference:
  1. ❌ NON eseguire la richiesta
  2. 📢 Notificare il conflitto:
     "Questa richiesta viola [SECTION] del Quick Reference.
      Nello specifico: [EXACT RULE].
      Suggerisco invece: [ALTERNATIVE]."
  3. ⏸️ Attendere conferma o riformulazione

SE ambiguità su come applicare una regola:
  1. 📖 Consultare Quick Reference per pattern simile
  2. 🔍 Verificare esempi concreti nel Quick Reference
  3. ❓ Se ambiguità persiste, chiedere chiarimenti:
     "Non è chiaro se [SCENARIO] richiede [OPTION_A] o [OPTION_B].
      Nel Quick Reference, [SIMILAR_CASE] suggerisce [PATTERN].
      Procedo con [PATTERN] o preferisci [ALTERNATIVE]?"
  4. 📝 Documentare decisione per consistency futura

SE richiesta per funzionalità non coperta:
  1. ✅ Verificare che sia allineata con principi generali
  2. 📐 Applicare pattern più simile dal Quick Reference
  3. 🔒 Verificare Security Checklist
  4. 📝 Documentare nuova decisione architettural (ADR)
```

---

## 📊 Metrics & KPIs

### Code Quality Metrics

```
✅ Target da Mantenere:

TypeScript Coverage:     100% (zero any)
Test Coverage:           > 80% (Server Actions)
Biome Violations:        0
Build Time:              < 30s (Turbopack)
Bundle Size (JS):        < 200KB (First Load)
Lighthouse Score:        > 90 (tutte le metriche)
Security Audit:          0 criticals (npm audit)
```

### Performance Budgets

```
✅ Target da Rispettare:

First Contentful Paint:  < 1.5s
Largest Contentful Paint: < 2.5s
Time to Interactive:     < 3.5s
Cumulative Layout Shift: < 0.1
First Input Delay:       < 100ms
```

---

## 🚀 Production Checklist

Estensione della **Final Checklist** del Quick Reference:

### Pre-Deploy Mandatory Checks

```bash
# 1. Code Quality
pnpm check              # Zero violations
pnpm test               # All tests pass
pnpm build              # Build success

# 2. Security Audit
pnpm audit              # Zero high/critical
npm audit signatures    # Verify packages

# 3. Type Safety
pnpm tsc --noEmit       # Zero errors

# 4. Database
pnpm db:generate        # Migrations up to date
pnpm db:push            # Schema synced

# 5. Environment
# Verify all NEXT_PUBLIC_* vars are safe
# Verify all secrets are in provider's env
# Test production build locally
```

### Post-Deploy Verification

```bash
# 1. Smoke Tests
□ Homepage loads
□ Auth flow works
□ Critical features functional

# 2. Monitoring
□ Error tracking active (Sentry)
□ Analytics tracking (Vercel)
□ Uptime monitoring configured

# 3. Performance
□ Lighthouse score > 90
□ Core Web Vitals green
□ No console errors

# 4. Security
□ HTTPS enabled
□ Security headers configured
□ CSP policy active
□ Rate limiting tested
```

---

## 📚 Appendix: Decision Records (ADR)

### Template per Nuove Decisioni Architetturali

```markdown
# ADR-XXX: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded

**Date:** YYYY-MM-DD

**Context:**
[Descrizione del problema o necessità]

**Decision:**
[Soluzione scelta]

**Consequences:**
**Positive:**
- [Beneficio 1]
- [Beneficio 2]

**Negative:**
- [Trade-off 1]
- [Trade-off 2]

**Alternatives Considered:**
1. [Opzione A] - Scartata perché [motivo]
2. [Opzione B] - Scartata perché [motivo]

**References:**
- [Link a Quick Reference section]
- [Link a discussione/issue]
```

---

## 🎯 Quick Decision Matrix

Usa questa matrice per decisioni rapide:

| Scenario | Quick Answer | Quick Ref Section |
|----------|-------------|-------------------|
| Serve useState? | "use client" | Mental Model |
| Serve async data? | Server Component | Mental Model |
| Accesso a cookies? | Wrap in Suspense | Suspense Architecture |
| Cachare i dati? | "use cache" + cacheLife | Caching Strategy |
| Form submission? | Server Action | Server Actions Template |
| API endpoint? | route.ts + NextResponse | API Routes |
| Auth check? | verifySession() in DAL | Security Checklist |
| Dati user-specific? | NO cache | Decision Matrix |
| Upload file? | Server Action + Blob | File Management |

---

## 🎉 Conclusione

### La Regola delle 3R (Remember, Refer, Repeat)

1. REMEMBER
   - Quick Reference = Bibbia del progetto
   - Security Checklist = Non negoziabile
   - Type Safety = Zero compromessi

2. REFER
   - Dubbio? → Quick Reference
   - Pattern? → Quick Reference
   - Error? → Troubleshooting section

3. REPEAT
   - Ogni task: Workflow standard
   - Ogni commit: Quality checks
   - Ogni deploy: Production checklist

---

## 💾 Database Architecture (Project-Specific)

### Stack Overview

```
┌─────────────────────────────────────────────────┐
│  Next.js App (Server Components / Actions)      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Data Access Layer (DAL)                        │
│  → Segue pattern dal Quick Reference            │
│  → verifySession(), DTO pattern, cache()        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Drizzle ORM                                    │
│  → Type-safe queries                            │
│  → Schema migrations                            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Turso (libsql)                                 │
│  → Edge-optimized SQLite                        │
│  → Global distribution                          │
└─────────────────────────────────────────────────┘
```

**WHY Turso?**

- ✅ SQLite compatibility (semplice, veloce, zero config)
- ✅ Edge-native (low latency globale)
- ✅ Generous free tier
- ✅ Type-safe con Drizzle ORM

**WHY Drizzle?**

- ✅ TypeScript-first (type safety garantita)
- ✅ Zero runtime overhead
- ✅ SQL-like syntax (learning curve bassa)
- ✅ Migrations automatiche

---

### Project Structure

```
src/db/
├── index.ts              # 🎯 Main export (usa questo nei componenti)
├── libsql.ts             # Turso client initialization
├── libsql-schemas/       # 📐 Schema definitions
│   ├── index.ts          # Export all schemas
│   ├── users.ts          # User table schema
│   ├── posts.ts          # Posts table schema (esempio)
│   └── files.ts          # Files metadata schema
├── seed.ts               # 🌱 Database seeding
└── test.ts               # 🧪 Database connection test

drizzle.config.ts         # Drizzle configuration
```

**Import Pattern (SEMPRE usare questo):**

```tsx
// ✅ CORRETTO - Import dal barrel export
import { db, users, posts } from '@/db';

// ❌ SBAGLIATO - Import diretto
import { db } from '@/db/libsql';
import { users } from '@/db/libsql-schemas/users';
```

---

### Initial Setup (One-Time)

#### 1. Turso Account & Database

```bash
# Installa Turso CLI
brew install tursodatabase/tap/turso  # macOS
# O segui: https://docs.turso.tech/cli/installation

# Login
turso auth login

# Crea database
turso db create event-manager-db

# Ottieni URL
turso db show --url event-manager-db
# Output: libsql://event-manager-db-yourname.turso.io

# Crea auth token
turso db tokens create event-manager-db
# Output: eyJhbGciOiJFZERTQS... (copia questo!)
```

#### 2. Environment Variables

```bash
# .env.local (NON committare!)
TURSO_DATABASE_URL=libsql://event-manager-db-yourname.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQS...
```

**⚠️ Security Check:**

```bash
# ✅ Verifica che .env.local sia in .gitignore
cat .gitignore | grep .env.local

# ✅ NEVER use NEXT_PUBLIC_ for database credentials
# ❌ WRONG: NEXT_PUBLIC_TURSO_DATABASE_URL
# ✅ CORRECT: TURSO_DATABASE_URL (server-only)
```

#### 3. Initial Migration

```bash
# Genera migrations dai schemas
pnpm db:generate

# Applica migrations al database
pnpm db:migrate

# (Opzionale) Seed con dati di esempio
pnpm db:seed

# Verifica connessione
pnpm db:test
```

---

### Common Workflows

#### Workflow 1: Aggiungere una Nuova Tabella

```bash
# STEP 1: Crea schema file
# src/db/libsql-schemas/events.ts
```

```typescript
// src/db/libsql-schemas/events.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  organizerId: integer('organizer_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// WHY: Export type per type safety
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
```

```typescript
// STEP 2: Export in index.ts
// src/db/libsql-schemas/index.ts
export * from './users';
export * from './events'; // ← Aggiungi questa linea
```

```bash
# STEP 3: Genera e applica migrations
pnpm db:generate  # Crea SQL migration file
pnpm db:migrate   # Applica al database

# STEP 4: (Opzionale) Ispeziona con Drizzle Studio
pnpm db:studio    # Apre UI su http://localhost:4983
```

#### Workflow 2: Modificare uno Schema Esistente

```typescript
// ESEMPIO: Aggiungere campo "status" a events
export const events = sqliteTable('events', {
  // ... campi esistenti
  status: text('status', { enum: ['draft', 'published', 'cancelled'] })
    .notNull()
    .default('draft'), // ← Nuovo campo
});
```

```bash
# Genera migration
pnpm db:generate
# Drizzle chiede conferma delle modifiche

# Applica migration
pnpm db:migrate

# ⚠️ WARNING: Se la tabella ha già dati, considera:
# - Valore di default appropriato
# - Data migration script (se necessario)
```

---

### DAL Integration (Critical!)

**SEMPRE usare DAL pattern per accesso al database.**

```typescript
// ❌ SBAGLIATO: Query diretta nel componente
// app/events/page.tsx
import { db, events } from '@/db';

export default async function EventsPage() {
  const allEvents = await db.select().from(events); // ⚠️ NO!
  return <EventsList events={allEvents} />;
}
```

```typescript
// ✅ CORRETTO: Query tramite DAL
// lib/dal/events.ts
import { cache } from 'react';
import { db, events, users } from '@/db';
import { eq } from 'drizzle-orm';
import { verifySession } from './auth';

// WHY: DTO type - solo campi sicuri
type EventDTO = {
  id: number;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  organizer: {
    id: number;
    name: string;
    // ❌ NO email, password
  };
};

export const getEvents = cache(async (): Promise<EventDTO[]> => {
  // WHY: cache() previene fetch duplicati nella stessa request

  try {
    const result = await db
      .select({
        // WHY: Select esplicito = DTO pattern
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        organizer: {
          id: users.id,
          name: users.name,
          // ❌ Exclude: users.email, users.password
        },
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.status, 'published'));

    return result as EventDTO[];

  } catch (error) {
    console.error('[DAL] Failed to fetch events:', error);
    throw new Error('Failed to fetch events');
  }
});

// Mutation example
export async function createEvent(data: NewEvent) {
  const session = await verifySession();
  if (!session) throw new Error('Unauthorized');

  // Validation should be done in Server Action
  // This is just data access

  return await db.insert(events).values({
    ...data,
    organizerId: session.userId,
  }).returning();
}
```

```typescript
// ✅ CORRETTO: Uso nel componente
// app/events/page.tsx
import { getEvents } from '@/lib/dal/events';

export default async function EventsPage() {
  const events = await getEvents(); // ✅ Tramite DAL
  return <EventsList events={events} />;
}
```

**Riferimento Quick Reference:**

- Sezione: "DAL Function Template"
- Pattern: cache(), verifySession(), DTO types

---

### Drizzle ORM Quick Reference

#### Query Patterns (Common Operations)

```typescript
import { db, users, events } from '@/db';
import { eq, and, or, like, gte, lte, desc, asc } from 'drizzle-orm';

// ===== SELECT =====
// All users
const allUsers = await db.select().from(users);

// Specific columns
const userNames = await db
  .select({ id: users.id, name: users.name })
  .from(users);

// WHERE conditions
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.status, 'active'));

// Multiple conditions (AND)
const result = await db
  .select()
  .from(events)
  .where(
    and(
      eq(events.status, 'published'),
      gte(events.startDate, new Date())
    )
  );

// OR conditions
const result = await db
  .select()
  .from(events)
  .where(
    or(
      eq(events.status, 'draft'),
      eq(events.status, 'published')
    )
  );

// LIKE search
const searchResults = await db
  .select()
  .from(events)
  .where(like(events.title, '%conference%'));

// JOIN
const eventsWithOrganizers = await db
  .select({
    event: events,
    organizer: users,
  })
  .from(events)
  .leftJoin(users, eq(events.organizerId, users.id));

// ORDER BY
const sortedEvents = await db
  .select()
  .from(events)
  .orderBy(desc(events.startDate));

// LIMIT & OFFSET (pagination)
const page = await db
  .select()
  .from(events)
  .limit(10)
  .offset(20); // Page 3 (10 items per page)

// ===== INSERT =====
// Single insert
const newUser = await db
  .insert(users)
  .values({
    name: 'John Doe',
    email: 'john@example.com',
  })
  .returning(); // Returns inserted row

// Multiple inserts
const newUsers = await db
  .insert(users)
  .values([
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
  ])
  .returning();

// ===== UPDATE =====
const updatedUser = await db
  .update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, 1))
  .returning();

// ===== DELETE =====
const deletedUser = await db
  .delete(users)
  .where(eq(users.id, 1))
  .returning();

// ===== TRANSACTIONS =====
await db.transaction(async (tx) => {
  // All operations in this block are transactional
  const user = await tx.insert(users).values({ ... }).returning();
  await tx.insert(events).values({ organizerId: user[0].id });

  // If any operation fails, entire transaction rolls back
});
```

#### Schema Patterns (Common Table Definitions)

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ===== TIMESTAMPS =====
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Auto-updated timestamps
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

// ===== ENUMS =====
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  status: text('status', {
    enum: ['todo', 'in_progress', 'done']
  }).notNull().default('todo'),

  priority: text('priority', {
    enum: ['low', 'medium', 'high']
  }).notNull().default('medium'),
});

// ===== FOREIGN KEYS =====
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Reference with cascade delete
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),

  // Reference with restrict (prevent deletion if comments exist)
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
});

// ===== UNIQUE CONSTRAINTS =====
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(), // Single column unique
  username: text('username').notNull(),
}, (table) => ({
  // Composite unique constraint
  uniqueUsername: unique().on(table.username, table.tenantId),
}));

// ===== INDEXES =====
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: real('price').notNull(),
}, (table) => ({
  // Create index for faster queries
  categoryIdx: index('category_idx').on(table.category),
  priceIdx: index('price_idx').on(table.price),
}));

// ===== JSON COLUMNS =====
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Store JSON data (stored as TEXT in SQLite)
  preferences: text('preferences', { mode: 'json' })
    .$type<{ theme: 'light' | 'dark'; notifications: boolean }>(),
});

// Usage:
const userSettings = await db.insert(settings).values({
  preferences: { theme: 'dark', notifications: true },
});
```

---

### Available Commands (Quick Reference)

```bash
# Development
pnpm db:studio        # 🎨 Open Drizzle Studio (GUI)
pnpm db:test          # 🧪 Test database connection

# Schema Management
pnpm db:generate      # 📝 Generate migrations from schema changes
pnpm db:migrate       # 🚀 Apply pending migrations
pnpm db:push          # ⚡ Push schema directly (dev only, skips migrations)

# Data Management
pnpm db:seed          # 🌱 Seed database with sample data

# ⚠️ WARNING: pnpm db:push bypasses migrations
# Use only in development for rapid prototyping
# In production, ALWAYS use db:generate + db:migrate
```

---

### Troubleshooting

#### Error: "LibsqlError: SQLITE_CONSTRAINT: UNIQUE constraint failed"

```typescript
// Causa: Tentativo di inserire duplicate unique value
const user = await db.insert(users).values({
  email: 'existing@example.com', // ⚠️ Email già esistente
});

// ✅ Soluzione: Gestire duplicati con try-catch
try {
  const user = await db.insert(users).values({ ... }).returning();
  return { success: true, user };
} catch (error) {
  if (error.message.includes('UNIQUE constraint')) {
    return { success: false, error: 'Email already exists' };
  }
  throw error; // Re-throw se errore diverso
}
```

#### Error: "LibsqlError: SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"

```typescript
// Causa: Tentativo di inserire con FK non esistente
const event = await db.insert(events).values({
  organizerId: 999, // ⚠️ User ID 999 non esiste
});

// ✅ Soluzione 1: Verificare FK prima di inserire
const user = await db.select().from(users).where(eq(users.id, userId));
if (!user.length) {
  throw new Error('User not found');
}

// ✅ Soluzione 2: Transaction per operazioni correlate
await db.transaction(async (tx) => {
  const user = await tx.insert(users).values({ ... }).returning();
  await tx.insert(events).values({
    organizerId: user[0].id // ✅ Garantito esistere
  });
});
```

#### Error: "Cannot connect to Turso database"

```bash
# Check 1: Verify env vars
echo $TURSO_DATABASE_URL
echo $TURSO_AUTH_TOKEN

# Check 2: Verify .env.local is loaded
cat .env.local

# Check 3: Test connection
pnpm db:test

# Check 4: Verify Turso database exists
turso db list
turso db show event-manager-db

# Check 5: Regenerate auth token if expired
turso db tokens create event-manager-db
```

#### Migrations Out of Sync

```bash
# Problema: Migrations locali diverse dal database remoto

# Soluzione 1: Reset migrations (SOLO in development!)
rm -rf drizzle/*
pnpm db:generate
pnpm db:push

# Soluzione 2: Manual migration sync (production)
turso db shell event-manager-db
# Inspect current schema, then adjust migrations manually

# ⚠️ NEVER delete migrations in production!
# Always create new migrations to fix issues
```

---

### Production Considerations

#### 1. Backup Strategy

```bash
# Turso automatic backups (included in paid plans)
turso db show event-manager-db --json | jq '.backups'

# Manual backup
turso db shell event-manager-db ".dump" > backup.sql

# Restore from backup
turso db shell event-manager-db < backup.sql
```

#### 2. Database Replication

```bash
# Create replica in different region
turso db replicate event-manager-db --region fra

# List replicas
turso db show event-manager-db --json | jq '.locations'
```

#### 3. Monitoring

```typescript
// Add query logging in production
import { db } from '@/db';

// Log slow queries
const startTime = Date.now();
const result = await db.select().from(users);
const duration = Date.now() - startTime;

if (duration > 1000) {
  console.warn(`[DB] Slow query detected: ${duration}ms`);
}
```

#### 4. Connection Pooling

```typescript
// src/db/libsql.ts
import { createClient } from '@libsql/client';

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,

  // Connection pool configuration
  connectionLimit: 10, // Max concurrent connections
  timeout: 5000,       // Query timeout (ms)
});
```

---

### Security Checklist (Database-Specific)

```
✅ Environment Variables
├─ TURSO_DATABASE_URL in .env.local (NOT committed)
├─ TURSO_AUTH_TOKEN in .env.local (NOT committed)
├─ NO NEXT_PUBLIC_ prefix for database credentials
└─ Production secrets in Vercel dashboard

✅ Query Security
├─ ALWAYS use parameterized queries (Drizzle does this by default)
├─ NEVER string concatenation for SQL
├─ Validate ALL user input before queries (Zod)
└─ Use DTO pattern (never expose full DB objects)

✅ Access Control
├─ ALL queries in DAL functions (never in components)
├─ verifySession() before sensitive queries
├─ Authorization checks (ownership, permissions)
└─ Rate limiting for write operations

✅ Data Protection
├─ Encrypt sensitive data at rest (use Turso encryption)
├─ Hash passwords (bcrypt, argon2)
├─ NO plain text secrets in database
└─ Audit logs for sensitive operations

✅ Migrations
├─ Review ALL migrations before applying
├─ Test migrations in staging first
├─ Backup before production migrations
└─ Version control for migration files
```

---

### Integration with Quick Reference

Questo capitolo si integra con le seguenti sezioni del Quick Reference:

| Quick Reference Section | Come si Collega |
|------------------------|-----------------|
| **DAL Function Template** | Usa Drizzle per DB access |
| **Server Actions Template** | Valida → DAL → Drizzle |
| **Security Checklist** | Applica a query DB |
| **cache() pattern** | Previene query duplicate |
| **DTO pattern** | Select esplicito in Drizzle |

**Workflow Completo:**

```
User Input
  ↓
Server Action (validation con Zod)
  ↓
DAL Function (auth check, cache())
  ↓
Drizzle Query (type-safe, parameterized)
  ↓
Turso Database
```

---

### Appendix: Migration Examples

#### Migration 1: Add Column with Default

```sql
-- drizzle/0001_add_status_column.sql
ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'draft' NOT NULL;
```

#### Migration 2: Create Index

```sql
-- drizzle/0002_add_email_index.sql
CREATE INDEX email_idx ON users(email);
```

#### Migration 3: Add Foreign Key

```sql
-- drizzle/0003_add_organizer_fk.sql
-- Note: SQLite requires table recreation for FK
CREATE TABLE events_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  organizer_id INTEGER NOT NULL,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO events_new SELECT * FROM events;
DROP TABLE events;
ALTER TABLE events_new RENAME TO events;
```

#### Migration 4: Data Migration

```sql
-- drizzle/0004_migrate_old_data.sql
-- Migra dati da formato vecchio a nuovo
UPDATE users
SET role = 'user'
WHERE role IS NULL;
```

---

## 🎯 TL;DR - Database Quick Start

```bash
# 1. Setup (one-time)
turso db create event-manager-db
turso db show --url event-manager-db
turso db tokens create event-manager-db

# 2. Configure .env.local
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=eyJ...

# 3. Initial migration
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 4. Daily workflow
# Edit schema → Generate → Migrate
pnpm db:studio  # Inspect DB
```

**Import Pattern:**

```typescript
import { db, users, events } from '@/db';
```

**Query Pattern:**

```typescript
// SEMPRE tramite DAL
export const getUsers = cache(async () => {
  return await db.select().from(users);
});
```

**Riferimenti:**

- Quick Reference: "DAL Function Template"
- Quick Reference: "Security Checklist"
- Drizzle Docs: <https://orm.drizzle.team>

---

### Support & Community

```
📖 Documentation: guide/nextjs16-quick-reference.md
🐛 Issues: dashboard/tasks-dashboard.json
📝 ADRs: docs/architecture-decisions/
```
