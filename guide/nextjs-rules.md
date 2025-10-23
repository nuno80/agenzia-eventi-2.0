## 🏗️ Architettura Generale

### Principi Fondamentali di Sviluppo

1. **Single Responsibility Principle (SRP)**: Ogni modulo, classe o funzione ha una sola, chiara responsabilità
2. **Don't Repeat Yourself (DRY)**: Evitare duplicazione di codice a favore di astrazioni riutilizzabili (utility, hook, componenti)
3. **Separation of Concerns (SoC)**: Logica presentazione (componenti), logica di business (servizi) e logica di accesso dati (DAL) **DEVONO** rimanere nettamente separate
4. **Type Safety First**: Sfruttare sistema di tipi di TypeScript per prevenire errori runtime. **Uso di `any` è SEVERAMENTE VIETATO**
5. **Keep It Simple, Stupid (KISS)**: Scegliere soluzioni semplici e dirette su quelle complesse
6. **You Aren't Gonna Need It (YAGNI)**: Implementare funzionalità solo quando necessaria, non quando anticipata

### Principi Next.js 15

- **Server-First**: Eseguire massimo codice sul server. Interattività client è eccezione, non norma
- **Performance by Default**: Sfruttare aggressivamente PPR (Partial Pre-rendering), streaming, caching, ottimizzazione asset
- **Sicurezza by Design**: Autorizzazione e validazione sono parte integrante e non negoziabile dell'architettura

#### Definizione "Server-First" (Metriche Concrete)

- ✅ **70%+ del codice** per una feature risiede in Server Components o DAL
- ✅ **Fetching dati** avviene nel server (RSC o Server Actions), MAI lato client con useEffect
- ✅ **Client Components** contengono SOLO: interattività UI (onClick, form input, toggle), state locale non persistente, animazioni
- ✅ Se Client Component **supera 40 linee**, valutare estrazione logica in componente più piccolo
- ✅ **NO localStorage/sessionStorage** - store tutti i dati in memory durante sessione o nel database

**Client Interactivity Accettabile**:

- Input form, toggle, dropdown, modal
- Loading state locale
- Animazioni e transizioni

**Client Interactivity Inaccettabile**:

- Logica di business nel Client Component
- Fetching dati con useEffect
- State globale per dati persistenti (usare DB + Server Actions invece)

### Flusso Dati End-to-End

```
User Interaction
    ↓
Client Component ("use client")
    ↓
Server Action (Authorization + Validation)
    ↓
Service Layer (Business Logic Orchestration)
    ↓
Data Access Layer (DB Queries/Mutations)
    ↓
Database
    ↓
Revalidation (invalidate cache)
    ↓
Updated Server Component (re-render)
```

---

## 📁 Struttura Progetto

```
projectName/
├── _blueprints/                    # Feature da sviluppare e stato
│   ├── FEAT-001/
│   │   └── feature-description.md
│   ├── FEAT-002/
│   └── state/
│       ├── tasks.json              # Stato task sequenziale
│       ├── logica-app.json         # Mappa domains e servizi
│       └── struttura-progetto.json # Inventory file del progetto
├── database/
│   ├── schema.sql                  # Source of truth schema
│   ├── starter_default.db          # Database locale (gitignored)
│   ├── adhoc_changes.sql           # Scratchpad per modifiche
│   ├── backups/                    # Backup timestamped (gitignored)
│   └── .gitkeep
├── src/
│   ├── app/                        # Next.js App Router - pagine e layout
│   │   ├── layout.tsx              # Root layout con tema e font
│   │   ├── page.tsx                # Home page
│   │   ├── (auth)/                 # Grouped routes autenticazione
│   │   ├── events/                 # Feature events
│   │   │   ├── page.tsx            # Lista eventi (RSC)
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx        # Dettaglio evento
│   │   │   └── new/
│   │   │       └── page.tsx        # Crea nuovo evento
│   │   ├── dashboard/              # Admin-only dashboard
│   │   └── error.tsx, not-found.tsx
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (generator)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── event/                  # Componenti domain events
│   │   │   ├── event-card.tsx      # Client component
│   │   │   ├── event-form.tsx      # Client component
│   │   │   └── event-list.tsx      # Server component con Suspense
│   │   └── participant/            # Componenti domain participants
│   │       ├── participant-table.tsx
│   │       └── check-in-button.tsx
│   ├── data/                       # Data Access Layer per domain
│   │   ├── events/
│   │   │   ├── queries.ts          # SELECT, JOIN, filtering puro
│   │   │   ├── mutations.ts        # INSERT, UPDATE, DELETE wrapper
│   │   │   ├── schema.ts           # Zod schemas validazione input
│   │   │   └── actions.ts          # Server Actions (autorizzazione + validazione + service + cache)
│   │   ├── participants/
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   ├── schema.ts
│   │   │   └── actions.ts
│   │   └── users/
│   │       └── queries.ts
│   ├── services/                   # Business Logic Layer (orchestrazione)
│   │   ├── events/
│   │   │   ├── event.service.ts    # Orchestrazione principale
│   │   │   └── event.validators.ts # Regole business complesse
│   │   └── participants/
│   │       └── participant.service.ts
│   ├── lib/                        # Utility, hooks, configurazioni
│   │   ├── types/
│   │   │   ├── result.ts           # Result<T> type generico
│   │   │   └── index.ts            # Esportazioni centrali
│   │   ├── helpers/
│   │   │   ├── response.ts         # ok(), err() helper functions
│   │   │   └── index.ts
│   │   ├── server-actions/
│   │   │   ├── auth-wrapper.ts     # createAuthorizedAction wrapper
│   │   │   └── index.ts
│   │   ├── db/
│   │   │   ├── index.ts            # DB connection singleton
│   │   │   └── schema.ts           # TypeScript schema type inference
│   │   ├── auth/
│   │   │   ├── get-current-user.ts # Wrapped in React.cache()
│   │   │   ├── require-user.ts     # Throws if not authenticated
│   │   │   └── require-admin.ts    # Throws if not admin role
│   │   └── hooks/                  # Custom React hooks (client-safe)
│   │       ├── use-mutation.ts
│   │       └── use-query.ts        # (nota: preferire RSC + Pass Promise)
│   └── types/
│       ├── index.ts                # Global TypeScript definitions (Event, User, Participant)
│       └── errors.ts               # Custom error types
├── tests/
│   ├── unit/                       # Jest/Vitest - funzioni pure, validatori
│   │   ├── services/
│   │   ├── helpers/
│   │   └── validators/
│   ├── integration/                # Jest/Vitest - DAL + Server Actions + DB test
│   │   ├── data/
│   │   └── services/
│   └── e2e/                        # Playwright - flussi utente critici
│       ├── event-creation.spec.ts
│       └── participant-checkin.spec.ts
├── .env.local.example
├── .eslintrc.json
├── .prettierrc.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json                 # shadcn/ui config
├── package.json
├── pnpm-lock.yaml
└── Dockerfile, docker-compose.yml
```

---

## 🧠 Layering: DAL, Services, Server Actions, Components

Questa è l'architettura fondamentale del progetto. Ogni layer ha responsabilità ben definite e confini rigidi.

### Layer 1: Data Access Layer (DAL) - `src/data/<domain>/`

**Responsabilità**: Accesso diretto al database. **ZERO logica di business**.

**Organizzazione**:

```
src/data/events/
├── queries.ts      # Funzioni SELECT, filtering, joins
├── mutations.ts    # Funzioni INSERT, UPDATE, DELETE
└── schema.ts       # Zod schemas per validazione input
```

**Vincoli Obbligatori**:

- DEVE includere `'server-only'` all'inizio di file che accedono a dati sensibili
- Ogni funzione che legge dati utente-specifici DEVE verificare autorizzazione con `requireUser()` all'inizio
- Output **sempre** tipizzato, **NO `any`**
- **Niente `try/catch`** - propagare eccezioni al layer superiore (Service Layer o Server Action)
- **Niente logica condizionale complessa** - solo query semplici

**Accoppiamento Massimo DAL**:

- Dipendenze FROM: schema Zod, database connection
- Dipendenze TO: Nessuna (isolato)

**Esempio Concettuale** (pseudo-codice):

```
// queries.ts
const getEventById = async (eventId, userId) => {
  requireUser(userId)
  query = SELECT * FROM events WHERE id = ? AND created_by = ?
  return query.get(eventId, userId)
}

// mutations.ts
const insertEvent = async (data) => {
  query = INSERT INTO events VALUES (...)
  return query.run(data)
}
```

### Layer 2: Service Layer - `src/services/<domain>/`

**Responsabilità**: Orchestrazione tra DAL e logica di business. Regole di dominio complesse.

**Organizzazione**:

```
src/services/events/
├── event.service.ts      # Orchestrazione principale
└── event.validators.ts   # Regole business complesse
```

**Vincoli Obbligatori**:

- Importa SOLO da: DAL (`src/data/`), Zod schema, helper comuni
- **MAI dipendenza da componenti UI o Server Actions**
- Può gestire transazioni multi-tabella
- Implementa regole di business (es: "evento non eliminabile se 100+ partecipanti")
- Usa `try/catch` per convertire eccezioni DAL in error strutturati

**Accoppiamento Massimo Services**:

- Dipendenze FROM: DAL, schema Zod, altri service (max 2 livelli di profondità)
- Dipendenze TO: Nessuna

**Esempio Concettuale**:

```
// event.service.ts
const publishEvent = async (eventId, userId) => {
  event = getEventById(eventId)  // DAL

  // Regola business: solo creatore
  if event.createdBy !== userId:
    throw "UNAUTHORIZED"

  // Validazione dominio
  validateEventUpdate(event, { status: "published" })

  // Orchestrazione DAL
  return updateEventStatus(eventId, "published")
}
```

### Layer 3: Server Actions - `src/data/<domain>/actions.ts`

**Responsabilità**: Endpoint di mutazione. **Autorizzazione → Validazione → Service Layer → Cache Invalidation → Response**.

**Workflow Obbligatorio** (non saltare step):

1. **Autorizzazione**: Verifica `requireUser()` e ruolo se necessario
2. **Validazione Input**: Validare con Zod schema
3. **Chiamata Service**: Orchestrazione logica business
4. **Revalidazione Cache**: `revalidatePath()` o `revalidateTag()`
5. **Ritorno**: `ApiResponse<T>` (mai exceptions dirette al client)

**Vincoli Obbligatori**:

- DEVE usare wrapper `createAuthorizedAction` (definito in Sezione "Helper Response")
- Output **SEMPRE** `ApiResponse<T>` - mai throware exceptions
- **Niente logica di business diretta** - solo coordinamento tra layer
- Deve essere `"use server"` directive

**Accoppiamento Massimo Server Actions**:

- Dipendenze FROM: Service Layer, Zod schema
- Dipendenze TO: Nessuna

**Esempio Concettuale**:

```
// src/data/events/actions.ts
"use server"

export const publishEventAction = createAuthorizedAction(
  CreateEventSchema,
  async (input, userId) => {
    event = publishEvent(input.eventId, userId)  // Service
    revalidatePath("/events")                     // Cache invalidation
    return event
  }
)
```

### Layer 4: React Components

**Regola Fondamentale**: Componenti sono **Server Components di default**.

**Server Components** (NO `"use client"`):

- Fetching dati via DAL (oppure chiamate dirette al DB con `'server-only'`)
- Avvolti in `<Suspense>` per streaming
- Passano Promise al Client Component figlio (vedi "Pass the Promise Pattern")
- **Output**: HTML statico o streaming content

**Client Components** (`"use client"`):

- Direttiva posizionata nel componente **foglia più piccolo e isolato** possibile
- Contengono SOLO: gestione stato locale (form input, toggle, modal), event handler, animazioni
- **MAI** logica di business, **MAI** DB access diretto, **MAI** new Promise fetch
- Consumano Promise con `React.use()` da parent Server Component
- Chiamano Server Actions per mutazioni

**Esempio Pattern RSC + Pass the Promise**:

```typescript
// src/app/events/page.tsx (Server Component)
export default function EventsPage() {
  // NO await - pass Promise directly
  const eventsPromise = getEvents();

  return (
    <Suspense fallback={<EventsSkeleton />}>
      <EventsList promise={eventsPromise} />
    </Suspense>
  );
}

// src/components/event/events-list.tsx (Client Component)
"use client";

import { use } from "react";
import { publishEventAction } from "@/data/events/actions";

export function EventsList({ promise }: { promise: Promise<Event[]> }) {
  // Consume Promise in client component
  const events = use(promise);

  const handlePublish = async (eventId: string) => {
    const result = await publishEventAction({ eventId });
    if (!result.success) {
      // Handle error
      console.error(result.error.message);
    }
  };

  return (
    <>
      {events.map(e => (
        <button key={e.id} onClick={() => handlePublish(e.id)}>
          Publish
        </button>
      ))}
    </>
  );
}
```

**WHY Pass the Promise Pattern**:

- Elimina `useEffect` data fetching (anti-pattern)
- Permette al Server Component di iniziare fetch prima del client render
- Streaming + Suspense boundary riduce perceived latency
- Type-safe: Promise<T> è tipizzato

### Rendering Strategy con PPR (Partial Pre-rendering)

**Obbligatorio per ogni pagina dinamica**:

```typescript
export const experimental_ppr = true;

export default function Page() {
  return (
    <>
      {/* Questo è PRE-RENDERIZZATO staticamente */}
      <Header />

      {/* Questo è STREAMING dinamicamente */}
      <Suspense fallback={<SkeletonContent />}>
        <DynamicContent />
      </Suspense>
    </>
  );
}
```

**Quando usare**:

- Pagina ha una "shell" statica (header, layout) + contenuto dinamico (dati utente)
- Vuoi cache la shell statica ma streaming il contenuto dinamico

---

## 📦 Tipi e Helper Centralizzati

### Result Type - `src/lib/types/result.ts`

**Scopo**: Type generico per tutte le risposte da DAL, Service, Server Actions.

```typescript
// Pseudocodice
type Result<T, E = ErrorCode> =
  | { success: true; data: T }
  | { success: false; error: E };

type ApiResponse<T> = Result<T, { code: string; message: string }>;

type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "CONFLICT";
```

**Utilizzo**:

- DAL ritorna `T` diretto (propagare exception per errori)
- Service ritorna `Result<T>` (gestire exception da DAL)
- Server Actions ritorna `ApiResponse<T>` (sempre)
- Componenti client consumano `ApiResponse<T>` e controllano `result.success`

### Response Helpers - `src/lib/helpers/response.ts`

**Scopo**: Factory functions per creare risposte standardizzate.

```typescript
// Pseudocodice
export const ok = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export const err = (code: string, message: string): ApiResponse<never> => ({
  success: false,
  error: { code, message },
});

export const errorMessages: Record<string, string> = {
  UNAUTHORIZED: "Autenticazione richiesta",
  FORBIDDEN: "Accesso negato",
  NOT_FOUND: "Risorsa non trovata",
  VALIDATION_ERROR: "Dati non validi",
  INTERNAL_ERROR: "Errore interno del server",
  CONFLICT: "Conflitto durante operazione",
};
```

**Utilizzo**:

```typescript
// In Server Action
if (!user) return err("UNAUTHORIZED", errorMessages.UNAUTHORIZED);
return ok(createdEvent);
```

### Authorized Action Wrapper - `src/lib/server-actions/auth-wrapper.ts`

**Scopo**: Wrapper riutilizzabile che implementa il workflow obbligatorio (Autorizzazione → Validazione → Service → Response).

```typescript
// Pseudocodice
export const createAuthorizedAction = <Input, Output>(
  schema: ZodSchema,
  handler: (input: Input, userId: string) => Promise<Output>
): ((input: Input) => Promise<ApiResponse<Output>>) => {
  return async (input: Input): Promise<ApiResponse<Output>> => {
    try {
      // 1. Autorizzazione
      const user = await requireUser();

      // 2. Validazione
      const validated = schema.parse(input);

      // 3. Esecuzione Service
      const data = await handler(validated, user.id);

      // 5. Response
      return ok(data);
    } catch (error) {
      if (error instanceof ZodError) {
        return err("VALIDATION_ERROR", error.message);
      }
      if (error.message === "UNAUTHORIZED") {
        return err("UNAUTHORIZED", errorMessages.UNAUTHORIZED);
      }
      return err("INTERNAL_ERROR", errorMessages.INTERNAL_ERROR);
    }
  };
};
```

**Utilizzo**:

```typescript
export const publishEventAction = createAuthorizedAction(
  PublishEventSchema,
  async (input, userId) => {
    // SOLO logica orchestrazione, rest gestito da wrapper
    return publishEvent(input.eventId, userId);
  }
);
```

**Benefici**:

- Eliminazione boilerplate ripetuto
- Consistenza tra tutte le Server Actions
- Autorizzazione e validazione centralizzate

---