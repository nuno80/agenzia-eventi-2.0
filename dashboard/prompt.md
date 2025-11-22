# PROMPT: Implementazione Event Management Dashboard da Struttura Esistente

## Contesto
Nella directory `Dashboard/` ho i seguenti file di riferimento che definiscono la struttura completa della mia dashboard per la gestione eventi:

1. **event-mgmt-dashboard.tsx** - Struttura UI completa commentata con tutti i componenti
2. **dal-events-implementation.ts** - Data Access Layer per eventi
3. **drizzle-schema-events.ts** - Schema database Drizzle ORM
4. **server-actions-events.ts** - Server Actions per mutations
5. **db-setup-complete.ts** - Guida setup completo

## Obiettivo
Voglio implementare questa dashboard in Next.js 16 seguendo esattamente la struttura e i pattern definiti nei file di riferimento.

## Stack Tecnologico Confermato
- **Framework**: Next.js 16 (App Router)
- **Database**: Torso (Better-SQLite3)
- **ORM**: Drizzle ORM
- **Auth**: [DA DECIDERE: Better Auth / Clerk / Kinde]
- **Email**: Resend
- **File Storage**: vercel-blob
- **UI**: shadcn/ui
- **Validation**: Zod
- **Styling**: Tailwind CSS

## Struttura Directory Target
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Layout con Sidebar + Header
│   │   ├── page.tsx                # Dashboard Home
│   │   ├── eventi/
│   │   │   ├── page.tsx            # Lista eventi
│   │   │   ├── nuovo/page.tsx      # Form creazione
│   │   │   └── [id]/
│   │   │       └── [tab]/page.tsx  # Dettaglio con tabs
│   │   ├── persone/
│   │   │   ├── partecipanti/page.tsx
│   │   │   ├── relatori/page.tsx
│   │   │   ├── sponsor/page.tsx
│   │   │   └── staff/page.tsx
│   │   ├── finance/
│   │   │   ├── page.tsx
│   │   │   └── report/page.tsx
│   │   └── impostazioni/page.tsx
│   └── actions/
│       ├── events.ts               # Server Actions eventi
│       └── [altre entità].ts
├── components/
│   └── dashboard/
│       ├── layout/
│       │   ├── Sidebar.tsx         # CLIENT
│       │   ├── Header.tsx          # CLIENT
│       │   └── index.ts
│       ├── ui/
│       │   ├── Button.tsx          # SERVER
│       │   ├── Card.tsx            # SERVER
│       │   ├── Badge.tsx           # SERVER
│       │   └── index.ts
│       ├── home/
│       │   ├── UrgentDeadlines.tsx # SERVER
│       │   ├── StatsOverview.tsx   # SERVER
│       │   ├── UpcomingEvents.tsx  # SERVER
│       │   └── index.ts
│       ├── events/
│       │   ├── EventList.tsx       # SERVER
│       │   ├── EventCard.tsx       # SERVER
│       │   ├── EventForm.tsx       # CLIENT
│       │   ├── EventHeader.tsx     # SERVER
│       │   ├── EventTabs.tsx       # CLIENT
│       │   └── tabs/
│       │       ├── OverviewTab.tsx
│       │       ├── ParticipantsTab.tsx
│       │       ├── SpeakersTab.tsx
│       │       ├── SponsorsTab.tsx
│       │       ├── AgendaTab.tsx
│       │       ├── ServicesTab.tsx
│       │       ├── BudgetTab.tsx
│       │       ├── CommunicationsTab.tsx
│       │       ├── SurveysTab.tsx
│       │       └── CheckinTab.tsx
│       ├── people/
│       │   └── PeopleTable.tsx     # CLIENT
│       ├── finance/
│       │   ├── BudgetTable.tsx     # SERVER
│       │   └── BudgetChart.tsx     # CLIENT
│       └── settings/
│           └── SettingsForm.tsx    # CLIENT
├── lib/
│   ├── db/
│   │   ├── index.ts                # Database connection
│   │   └── schema.ts               # Drizzle schemas
│   ├── dal/
│   │   ├── events.ts               # Data Access Layer
│   │   ├── participants.ts
│   │   ├── speakers.ts
│   │   ├── sponsors.ts
│   │   ├── deadlines.ts
│   │   └── budget.ts
│   ├── validations/
│   │   └── events.ts               # Zod schemas
│   └── utils.ts                    # Utility functions
└── ...
```

## Istruzioni per l'LLM

### FASE 1: Setup Iniziale
1. **Analizza i file di riferimento** in `Dashboard/` per comprendere:
   - La struttura completa dei componenti
   - I pattern Server/Client Components
   - La logica di data fetching
   - Le validazioni Zod

2. **Crea la struttura directory** come sopra definita

3. **Setup Database**:
   - Implementa `src/lib/db/index.ts` per connessione Torso
   - Implementa `src/lib/db/schema.ts` con tutte le tabelle (events, participants, speakers, sponsors, services, budgetCategories, deadlines, communications, surveys, checkins)
   - Crea `drizzle.config.ts` nella root
   - Aggiungi scripts in `package.json`:
```json
     "db:generate": "drizzle-kit generate:sqlite",
     "db:push": "drizzle-kit push:sqlite",
     "db:studio": "drizzle-kit studio"
```

### FASE 2: Implementazione DAL
4. **Data Access Layer** - Crea tutti i file DAL seguendo il pattern in `dal-events-implementation.ts`:
   - `src/lib/dal/events.ts` (usa il file di riferimento)
   - `src/lib/dal/participants.ts`
   - `src/lib/dal/speakers.ts`
   - `src/lib/dal/sponsors.ts`
   - `src/lib/dal/services.ts`
   - `src/lib/dal/deadlines.ts`
   - `src/lib/dal/budget.ts`

   **Pattern da seguire per ogni DAL**:
```typescript
   import { cache } from 'react';
   import { db } from '@/lib/db';

   export const getEntityById = cache(async (id: string) => {
     const entity = await db.query.entities.findFirst({
       where: eq(entities.id, id)
     });
     return entity || null;
   });

   // Altri metodi...
```

### FASE 3: Server Actions
5. **Implementa Server Actions** seguendo `server-actions-events.ts`:
   - `src/app/actions/events.ts` (usa il file di riferimento)
   - `src/app/actions/participants.ts`
   - `src/app/actions/speakers.ts`
   - `src/app/actions/sponsors.ts`
   - Etc.

   **Pattern da seguire**:
```typescript
   "use server";
   import { revalidatePath } from 'next/cache';

   export async function createEntity(formData: FormData) {
     // 1. Validate with Zod
     // 2. Insert into DB
     // 3. Revalidate cache
     // 4. Return ActionResult
   }
```

### FASE 4: UI Components
6. **Implementa componenti UI base** (shadcn/ui):
   - Installa shadcn/ui: `npx shadcn-ui@latest init`
   - Aggiungi componenti necessari:
```bash
     npx shadcn-ui@latest add button card badge table input select textarea
```

7. **Componenti Layout (CLIENT)**:
   - `src/components/dashboard/layout/Sidebar.tsx`
     - Aggiungi `"use client"` in cima
     - Usa `useState` per mobile menu
     - Usa `Link` da `next/link` per navigazione
   - `src/components/dashboard/layout/Header.tsx`
     - Aggiungi `"use client"` in cima
     - Gestisci mobile menu toggle

8. **Layout Root**:
   - `src/app/(dashboard)/layout.tsx` (CLIENT):
```typescript
     "use client";
     import { useState } from 'react';
     import Sidebar from '@/components/dashboard/layout/Sidebar';
     import Header from '@/components/dashboard/layout/Header';

     export default function DashboardLayout({ children }) {
       const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

       return (
         <div className="min-h-screen bg-gray-50">
           <Sidebar
             isMobileOpen={isMobileMenuOpen}
             onMobileClose={() => setIsMobileMenuOpen(false)}
           />
           <div className="lg:pl-64">
             <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
             <main className="p-6">{children}</main>
           </div>
         </div>
       );
     }
```

### FASE 5: Pagine Dashboard
9. **Dashboard Home** - `src/app/(dashboard)/page.tsx` (SERVER):
```typescript
   import { Suspense } from 'react';
   import { getUpcomingEvents, getEventStats } from '@/lib/dal/events';
   import { getUrgentDeadlines } from '@/lib/dal/deadlines';

   async function DashboardContent() {
     const [stats, events, deadlines] = await Promise.all([
       getEventStats(),
       getUpcomingEvents(),
       getUrgentDeadlines(),
     ]);

     return (
       <div className="space-y-8">
         <UrgentDeadlines deadlines={deadlines} />
         <StatsOverview stats={stats} />
         <UpcomingEvents events={events} />
       </div>
     );
   }

   export default function DashboardPage() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <DashboardContent />
       </Suspense>
     );
   }
```

10. **Eventi Pages**:
    - `src/app/(dashboard)/eventi/page.tsx` - Lista eventi (SERVER)
    - `src/app/(dashboard)/eventi/nuovo/page.tsx` - Form creazione (usa EventForm CLIENT)
    - `src/app/(dashboard)/eventi/[id]/[tab]/page.tsx` - Dettaglio con tabs (SERVER)

    **Pattern per dettaglio evento**:
```typescript
    export default async function EventDetailPage({ params }) {
      const { id, tab } = await params;
      const event = await getEventById(id);

      if (!event) notFound();

      return (
        <div className="space-y-6">
          <EventHeader event={event} />
          <EventTabs currentTab={tab} eventId={id} />
          {renderTabContent(tab, event)}
        </div>
      );
    }
```

### FASE 6: Componenti Specifici
11. **Componenti Home** (SERVER):
    - Splittare `DashboardHome` dal file di riferimento in:
      - `UrgentDeadlines.tsx`
      - `StatsOverview.tsx`
      - `UpcomingEvents.tsx`

12. **Componenti Eventi**:
    - `EventList.tsx` (SERVER) - Display lista
    - `EventForm.tsx` (CLIENT) - Form con validazione
    - `EventTabs.tsx` (CLIENT) - Tab navigation
    - Tutti i tab components (SERVER per default, CLIENT se servono interazioni)

### FASE 7: Utilities
13. **Utility Functions** - `src/lib/utils.ts`:
```typescript
    export function getPriorityColor(priority: string) {
      // Da event-mgmt-dashboard.tsx
    }

    export function getDaysUntil(date: Date | string) {
      // Da event-mgmt-dashboard.tsx
    }

    export function formatCurrency(amount: number) {
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    }
```

14. **Validation Schemas** - `src/lib/validations/events.ts`:
```typescript
    import { z } from 'zod';

    export const createEventSchema = z.object({
      // Copia da drizzle-schema-events.ts
    });
```

### FASE 8: Testing & Refinement
15. **Test Data Fetching**:
    - Verifica che tutte le query DAL funzionino
    - Testa le Server Actions
    - Verifica cache invalidation

16. **Test UI**:
    - Navigazione tra pagine
    - Mobile responsiveness
    - Form submission
    - Error handling

## Regole Importanti da Seguire

### ✅ DO:
1. **Usa Server Components per default** - Aggiungi `"use client"` solo quando necessario
2. **Await params** - In Next.js 16: `const { id } = await params;`
3. **Usa React cache()** - Wrappa tutte le query DAL
4. **Revalida cache** - Dopo ogni mutation: `revalidatePath()` o `revalidateTag()`
5. **Valida input** - Usa Zod in tutte le Server Actions
6. **Gestisci errori** - Return `ActionResult` consistente
7. **Usa Suspense** - Per componenti con data fetching lenti
8. **Type safety** - Sfrutta i tipi inferiti da Drizzle
9. **Commenta il codice** - Specifica se Server/Client e perché

### ❌ DON'T:
1. **Non usare localStorage/sessionStorage** negli artifacts
2. **Non mettere `"use client"` ovunque** - Solo dove serve interattività
3. **Non fare fetch nel Client** - Usa DAL in Server Components
4. **Non esporre queries** - Usa sempre DAL layer
5. **Non dimenticare validazione** - Mai fidarsi dell'input utente
6. **Non bloccare UI** - Usa Suspense per caricamenti asincroni

## Priorità di Implementazione

### Priorità 1 (Core):
- [ ] Database setup + schema completo
- [ ] DAL events
- [ ] Server Actions events
- [ ] Layout (Sidebar + Header)
- [ ] Dashboard Home
- [ ] Lista Eventi
- [ ] Dettaglio Evento (almeno tab Overview)

### Priorità 2 (Features):
- [ ] Form Creazione Evento funzionante
- [ ] DAL + Actions per Participants
- [ ] Tab Partecipanti
- [ ] DAL + Actions per Deadlines
- [ ] UrgentDeadlines funzionante
- [ ] Tab Budget

### Priorità 3 (Advanced):
- [ ] Altri DAL (speakers, sponsors, services)
- [ ] Tutti i tab eventi
- [ ] Pagine Persone
- [ ] Finance overview
- [ ] Export Excel/PDF
- [ ] QR Code generation
- [ ] Email notifications

## Output Atteso

Per ogni componente che crei, fornisci:
1. **Path completo del file**
2. **Codice completo** (non placeholder)
3. **Commento in cima** che specifica:
   - Se è Server o Client Component
   - Perché è Server o Client
   - Le props accettate
   - Come viene usato

**Esempio**:
```typescript
/**
 * EventList Component
 * TYPE: Server Component
 * REASON: Display-only, fetches data from database
 * PROPS: events (Event[])
 * USAGE: In /eventi page
 */

import { Event } from '@/lib/db/schema';
import { EventCard } from './EventCard';

export function EventList({ events }: { events: Event[] }) {
  return (
    <div className="space-y-4">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

## Domande per l'LLM

Prima di iniziare, rispondi:
1. Hai compreso la struttura completa dai file di riferimento?
2. Hai chiaro il pattern Server Components vs Client Components?
3. Hai capito come usare il DAL con React cache()?
4. Hai compreso il pattern Server Actions con Zod validation?
5. Da quale fase vuoi che inizi? (Suggerisco Fase 1 → Setup Iniziale)

## Risorse Aggiuntive

- **Next.js 16 Docs**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team
- **shadcn/ui**: https://ui.shadcn.com
- **Zod**: https://zod.dev

---

**Inizia dall'implementazione sistematica seguendo le fasi. Chiedi conferma prima di procedere con codice voluminoso.**
