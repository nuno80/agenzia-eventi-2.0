# 🤖 Setup per Claude Code - EventApp

## 📦 Cosa Preparare PRIMA di Aprire Claude Code

### 1. Context Bundle (cartella _context/)
Crea una cartella con questi file che fornirai a Claude Code:
```
event-app/
├── _context/                          ← Questa è la cartella magica
│   ├── 00_project_brief.md           ← Overview progetto
│   ├── 01_database_schema.sql        ← Schema completo DB
│   ├── 02_api_specs.md               ← Documentazione API routes
│   ├── 03_tech_stack.md              ← Tech stack + convenzioni
│   └── 04_task_list.json             ← Task breakdown Week 1
```

---

## 📄 Contenuto dei File Context

### File 1: 00_project_brief.md

```markdown
# EventApp - Project Brief

## Obiettivo MVP
Piattaforma gestione eventi B2B (congressi medici, conferenze) con:
- Admin: CRUD eventi + gestione completa
- Staff: Check-in QR code
- Partecipanti: Registrazione self-service
- Relatori: Upload materiali + rimborsi
- Sponsor: Visualizzazione deliverables

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Auth**: Clerk (già configurato nello starter kit)
- **Database**: SQLite + better-sqlite3
- **UI**: Tailwind CSS + shadcn/ui (da aggiungere Week 3)
- **Validation**: Zod
- **Deployment**: Vercel

## Project Structure
```
src/
├── app/
│   ├── admin/events/          # Dashboard admin
│   ├── events/                # Portal pubblico
│   ├── api/
│   │   ├── events/            # CRUD eventi
│   │   └── registrations/     # Gestione registrazioni
│   └── dashboard/             # User dashboard
├── lib/
│   ├── db.ts                  # SQLite connection
│   └── migrations/            # SQL schema files
└── components/
    └── ui/                    # shadcn components (Week 3)
```

## Ruoli Clerk (già implementati nello starter kit)
- `admin`: Accesso completo
- `staff`: Solo check-in
- `speaker`: Gestione materiali
- `participant`: Registrazione eventi
- `sponsor`: View-only deliverables

## Week 1 Goals
1. Database setup (events + registrations tables)
2. API routes funzionanti (POST/GET eventi, POST registrazioni)
3. UI minimale ma funzionale:
   - Admin: Lista eventi + form creazione
   - Public: Portale eventi + registrazione
4. Gestione capacità massima + waitlist automatica

## Coding Conventions
- TypeScript strict mode
- Server Components by default, 'use client' solo quando necessario
- Error handling con try-catch + logging
- Zod per validation input
- Commenti solo per logica complessa
- File header obbligatorio:
```typescript
  // File: nome-file.tsx
  // Path: src/app/...
  // Type: React Component / API Route / Utility
```

## Database Naming
- Tables: lowercase snake_case (events, registrations)
- Columns: snake_case (user_id, created_at)
- IDs: nanoid (non UUID per brevità)
- Timestamps: ISO 8601 string format

## Non Implementare (fuori scope Week 1)
- QR code generation/scanning (Week 2)
- Budget tracking (Week 2)
- Questionari post-evento (Week 3)
- Design system polish (Week 3)
- Email notifications (Week 3)
```

---

### File 2: 01_database_schema.sql

```sql
-- EventApp Database Schema
-- SQLite + better-sqlite3
-- Version: 1.0 (Week 1)

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================
-- TABLE: events
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK(event_type IN ('congress', 'conference', 'workshop', 'fair')),
  start_date TEXT NOT NULL, -- ISO 8601: 2025-06-15T09:00:00Z
  end_date TEXT NOT NULL,
  location TEXT NOT NULL,
  max_capacity INTEGER NOT NULL CHECK(max_capacity > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
  created_by TEXT NOT NULL, -- Clerk user ID
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_created_by ON events(created_by);

-- ============================================
-- TABLE: registrations
-- ============================================
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Clerk user ID
  user_email TEXT NOT NULL,
  user_name TEXT,
  status TEXT NOT NULL DEFAULT 'registered' CHECK(status IN ('registered', 'waitlist', 'checked_in', 'cancelled')),
  registration_type TEXT NOT NULL CHECK(registration_type IN ('invited', 'self', 'manual')),
  checked_in_at TEXT, -- Timestamp ISO 8601 quando fa check-in
  qr_code TEXT, -- Week 2: JSON payload per QR
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(event_id, user_id) -- Un utente = una registrazione per evento
);

CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);

-- ============================================
-- SEED DATA (development only)
-- ============================================
-- Inserire tramite seed.ts script, non qui

-- ============================================
-- QUERIES COMUNI (per reference)
-- ============================================

-- Conteggio registrazioni evento:
-- SELECT COUNT(*) FROM registrations 
-- WHERE event_id = ? AND status IN ('registered', 'checked_in')

-- Posti disponibili:
-- SELECT 
--   e.max_capacity - COUNT(r.id) as available_spots
-- FROM events e
-- LEFT JOIN registrations r ON r.event_id = e.id 
--   AND r.status IN ('registered', 'checked_in')
-- WHERE e.id = ?
-- GROUP BY e.id

-- Check se utente già registrato:
-- SELECT * FROM registrations 
-- WHERE event_id = ? AND user_id = ?
```

---

### File 3: 02_api_specs.md

```markdown
# EventApp API Specifications

## Base URL
http://localhost:3000/api

## Authentication
Tutte le route protette richiedono Clerk session cookie.
Header automatico gestito da `@clerk/nextjs`.

---

## 📌 POST /api/events
**Descrizione**: Crea nuovo evento (solo admin)

**Auth**: Required (admin role)

**Request Body**:
```json
{
  "title": "Congresso Cardiologia 2025",
  "description": "Evento annuale di...",
  "event_type": "congress", // congress|conference|workshop|fair
  "start_date": "2025-06-15T09:00:00Z", // ISO 8601
  "end_date": "2025-06-17T18:00:00Z",
  "location": "Milano, Italia",
  "max_capacity": 200
}
```

**Validation (Zod)**:
- title: min 3, max 200 chars
- event_type: enum
- start_date < end_date
- max_capacity: int >= 1

**Success Response (201)**:
```json
{
  "success": true,
  "eventId": "abc123xyz"
}
```

**Error Responses**:
- 400: Validation error (Zod errors array)
- 401: Unauthorized
- 500: Internal server error

---

## 📌 GET /api/events
**Descrizione**: Lista eventi
**Auth**: Optional (filtra in base a ruolo)

**Query Params**:
- status (optional): draft|published|ongoing|completed

**Default**: published per utenti non-admin
**Admin vede tutti gli status**

**Success Response (200)**:
```json
{
  "events": [
    {
      "id": "abc123",
      "title": "Congresso...",
      "event_type": "congress",
      "start_date": "2025-06-15T09:00:00Z",
      "end_date": "2025-06-17T18:00:00Z",
      "location": "Milano",
      "max_capacity": 200,
      "status": "published",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## 📌 POST /api/registrations
**Descrizione**: Registra utente a evento
**Auth**: Required

**Request Body**:
```json
{
  "eventId": "abc123"
}
```

**Logic**:
1. Verifica evento esiste e status = 'published'
2. Conta registrazioni attuali (status = registered|checked_in)
3. Se count < max_capacity → status = 'registered'
4. Se count >= max_capacity → status = 'waitlist'
5. Estrae user_email e user_name da Clerk currentUser()

**Success Response (201)**:
```json
{
  "success": true,
  "registrationId": "xyz789",
  "status": "registered", // o "waitlist"
  "message": "Registration confirmed" // o "Added to waitlist"
}
```

**Error Responses**:
- 401: Unauthorized
- 404: Event not found
- 409: Already registered (UNIQUE constraint)
- 500: Internal error

---

## 📌 GET /api/events/[eventId]/registrations
**Descrizione**: Lista registrazioni per evento (admin only)
**Auth**: Required (admin)

**Success Response (200)**:
```json
{
  "registrations": [
    {
      "id": "xyz789",
      "user_email": "user@example.com",
      "user_name": "Mario Rossi",
      "status": "registered",
      "registration_type": "self",
      "created_at": "2025-01-20T14:30:00Z"
    }
  ],
  "stats": {
    "registered": 45,
    "waitlist": 5,
    "checked_in": 0,
    "available_spots": 150
  }
}
```

## Error Handling Standard
Tutte le API devono:
1. Wrappare logica in try-catch
2. Loggare errori: console.error('Context:', error)
3. Ritornare JSON strutturato:
```json
{ "error": "Human-readable message" }
```
4. Mai esporre stack trace in produzione
```

---

### File 4: 03_tech_stack.md

```markdown
# EventApp - Tech Stack Reference

## Core Dependencies (già installate)
```json
{
  "next": "15.x",
  "@clerk/nextjs": "^5.x",
  "react": "^19.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x"
}
```

## Dependencies da Installare (Week 1)
```bash
pnpm add better-sqlite3 zod nanoid date-fns
pnpm add -D @types/better-sqlite3
```

## Better-SQLite3 Setup
**next.config.mjs (già configurato)**
```javascript
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        { 'better-sqlite3': 'commonjs better-sqlite3' }
      ];
    }
    return config;
  }
};
```

## Database Connection Pattern
**typescript**
```typescript
// src/lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'event-app.db');
export const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
```

**IMPORTANTE**:
- DB file: event-app.db in root (aggiungere a .gitignore)
- Sempre usare prepared statements: db.prepare(sql).run(...)
- Mai string concatenation per SQL (SQL injection risk)

## Clerk Integration
**Middleware Setup (già configurato nello starter kit)**
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/dashboard(.*)',
  '/api/events(.*)',
  '/api/registrations(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});
```

## User Data Extraction
```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

// In API routes:
const { userId } = await auth();

// Per dati completi:
const user = await currentUser();
const email = user.emailAddresses[0]?.emailAddress;
const name = `${user.firstName} ${user.lastName}`.trim();
```

## Role Check (da implementare)
```typescript
// Aggiungere in Clerk Dashboard: User Metadata
// publicMetadata: { role: 'admin' | 'staff' | 'participant' }

const user = await currentUser();
const role = user.publicMetadata?.role as string;

if (role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## TypeScript Conventions
**Type Definitions**
```typescript
// src/types/event.ts
export type EventType = 'congress' | 'conference' | 'workshop' | 'fair';
export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
export type RegistrationStatus = 'registered' | 'waitlist' | 'checked_in' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_date: string; // ISO 8601
  end_date: string;
  location: string;
  max_capacity: number;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

**Zod Schemas**
```typescript
// src/lib/validations/event.ts
import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  event_type: z.enum(['congress', 'conference', 'workshop', 'fair']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  location: z.string().min(3),
  max_capacity: z.number().int().min(1)
}).refine(
  (data) => new Date(data.end_date) > new Date(data.start_date),
  { message: "End date must be after start date" }
);
```

## File Structure Best Practices
**Server Components (default)**
```typescript
// src/app/events/page.tsx
import { db } from '@/lib/db';

export default async function EventsPage() {
  const events = db.prepare('SELECT * FROM events').all();
  return <div>{/* JSX */}</div>;
}
```

**Client Components (interactivity)**
```typescript
// src/app/events/new/create-form.tsx
'use client';

import { useState } from 'react';

export function CreateForm() {
  const [loading, setLoading] = useState(false);
  // ... form logic
}
```

**API Routes**
```typescript
// src/app/api/events/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  // ... logic
  return NextResponse.json({ data });
}
```

## Error Handling Patterns
**API Routes**
```typescript
try {
  // Logic
  return NextResponse.json({ success: true });
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.errors }, 
      { status: 400 }
    );
  }
  console.error('API Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' }, 
    { status: 500 }
  );
}
```

**Client Components**
```typescript
const [error, setError] = useState<string>('');

try {
  const res = await fetch('/api/events', { method: 'POST', body });
  if (!res.ok) throw new Error('Request failed');
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
}
```

## Date Handling
**Libreria**: date-fns (già installata)
```typescript
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

// Display date
format(parseISO(event.start_date), 'dd MMMM yyyy', { locale: it });
// Output: "15 giugno 2025"

// Form input (datetime-local)
<input 
  type="datetime-local" 
  defaultValue={format(parseISO(event.start_date), "yyyy-MM-dd'T'HH:mm")}
/>
```

## Testing Checklist (manuale Week 1)

### Database
- [ ] Tabelle create correttamente
- [ ] Foreign keys funzionanti
- [ ] Unique constraints bloccano duplicati

### API
- [ ] POST /api/events con dati validi → 201
- [ ] POST /api/events con dati invalidi → 400
- [ ] GET /api/events ritorna array
- [ ] POST /api/registrations gestisce capacità

### UI
- [ ] Form creazione evento → salva nel DB
- [ ] Lista eventi pubblica mostra solo published
- [ ] Registrazione evento → aggiorna contatore posti

### Auth
- [ ] Route protette redirect a login
- [ ] User data estratto correttamente da Clerk
```

---

### File 5: 04_task_list.json

```json
{
  "project": "EventApp",
  "sprint": "Week 1 - Core Features",
  "tasks": [
    {
      "id": "T1",
      "title": "Database Setup",
      "priority": "P0",
      "estimated_hours": 1,
      "dependencies": [],
      "subtasks": [
        {
          "id": "T1.1",
          "title": "Create db.ts connection file",
          "file": "src/lib/db.ts",
          "acceptance": "File executes without errors, DB file created in root"
        },
        {
          "id": "T1.2",
          "title": "Create SQL schema migration",
          "file": "src/lib/migrations/001_initial_schema.sql",
          "acceptance": "Tables events and registrations created with all constraints"
        },
        {
          "id": "T1.3",
          "title": "Create migration runner script",
          "file": "src/lib/migrations/migrate.ts",
          "acceptance": "Script runs migrations automatically in dev mode"
        },
        {
          "id": "T1.4",
          "title": "Create seed data script (optional)",
          "file": "src/lib/migrations/seed.ts",
          "acceptance": "Test event inserted, visible via SQLite query"
        }
      ]
    },
    {
      "id": "T2",
      "title": "API Routes - Events",
      "priority": "P0",
      "estimated_hours": 2,
      "dependencies": ["T1"],
      "subtasks": [
        {
          "id": "T2.1",
          "title": "POST /api/events - Create event",
          "file": "src/app/api/events/route.ts",
          "acceptance": "Valid POST returns 201, invalid returns 400, saves to DB"
        },
        {
          "id": "T2.2",
          "title": "GET /api/events - List events",
          "file": "src/app/api/events/route.ts (extend)",
          "acceptance": "Returns array of events, filtered by status query param"
        }
      ]
    },
    {
      "id": "T3",
      "title": "API Routes - Registrations",
      "priority": "P0",
      "estimated_hours": 2,
      "dependencies": ["T2"],
      "subtasks": [
        {
          "id": "T3.1",
          "title": "POST /api/registrations - Register user",
          "file": "src/app/api/registrations/route.ts",
          "acceptance": "Handles capacity check, waitlist logic, duplicate prevention"
        }
      ]
    },
    {
      "id": "T4",
      "title": "Admin UI - Events Management",
      "priority": "P0",
      "estimated_hours": 3,
      "dependencies": ["T2"],
      "subtasks": [
        {
          "id": "T4.1",
          "title": "Events list page",
          "file": "src/app/admin/events/page.tsx",
          "acceptance": "Displays table of events with status badges, link to create"
        },
        {
          "id": "T4.2",
          "title": "Create event form (server component wrapper)",
          "file": "src/app/admin/events/new/page.tsx",
          "acceptance": "Renders form component"
        },
        {
          "id": "T4.3",
          "title": "Create event form (client component)",
          "file": "src/app/admin/events/new/create-event-form.tsx",
          "acceptance": "Form submits to API, shows errors, redirects on success"
        }
      ]
    },
    {
      "id": "T5",
      "title": "Public UI - Events Portal",
      "priority": "P0",
      "estimated_hours": 2.5,
      "dependencies": ["T3"],
      "subtasks": [
        {
          "id": "T5.1",
          "title": "Public events list page",
          "file": "src/app/events/page.tsx",
          "acceptance": "Shows published events, available spots, sold out indicator"
        },
        {
          "id": "T5.2",
          "title": "Event detail page (server component)",
          "file": "src/app/events/[eventId]/page.tsx",
          "acceptance": "Displays event info, checks if user registered"
        },
        {
          "id": "T5.3",
          "title": "Registration button (client component)",
          "file": "src/app/events/[eventId]/register-button.tsx",
          "acceptance": "Calls API, handles success/error, shows confirmation"
        }
      ]
    },
    {
      "id": "T6",
      "title": "End-to-End Testing",
      "priority": "P1",
      "estimated_hours": 1,
      "dependencies": ["T4", "T5"],
      "subtasks": [
        {
          "id": "T6.1",
          "title": "Manual test flow",
          "acceptance": "Admin creates event → Published → User registers → Count updates"
        }
      ]
    }
  ],
  "total_estimated_hours": 11.5
}
```

---

## 🎯 Come Usare Questi File con Claude Code

### Step 1: Setup Iniziale
```bash
cd event-app
mkdir _context
# Copia i 5 file sopra nella cartella _context
```

### Step 2: Primo Prompt a Claude Code
```
Ciao! Sto iniziando lo sviluppo di EventApp.

Ho preparato il context completo nella cartella _context/:
- 00_project_brief.md
- 01_database_schema.sql
- 02_api_specs.md
- 03_tech_stack.md
- 04_task_list.json

Leggi TUTTI i file context, poi:
1. Conferma di aver compreso l'architettura
2. Chiedi eventuali chiarimenti
3. Inizia con Task T1 (Database Setup) dal task_list.json

Ricorda:
- Segui ESATTAMENTE le convenzioni in 03_tech_stack.md
- Ogni file deve avere l'header con File/Path/Type
- Testa ogni subtask prima di procedere al successivo
```

### Step 3: Workflow Iterativo
Dopo ogni task completato:

#### Task T1 completato?
**Se sì**:
1. Mostrami un summary di cosa hai fatto
2. Dimmi come testare (es: quale query SQL eseguire)
3. Dopo che confermo il test OK, procedi con Task T2

**Se no**:
- Dammi l'errore specifico che hai incontrato