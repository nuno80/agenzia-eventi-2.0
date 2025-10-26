# Code Implementation for Feature: Gestione e Configurazione Eventi

## File System Structure

```
/
|-- src/
|   |-- app/
|   |   |-- admin/
|   |   |   |-- events/
|   |   |   |   |-- new/
|   |   |   |   |   |-- page.tsx              <-- NEW (Wizard Creazione Evento)
|   |   |   |   |-- [eventId]/
|   |   |   |   |   |-- layout.tsx            <-- NEW (Layout per singola dashboard evento)
|   |   |   |   |   |-- page.tsx              <-- NEW (Dashboard Evento Modulare)
|   |   |   |   |   |-- program/
|   |   |   |   |   |   |-- page.tsx          <-- NEW (Gestione Programma)
|   |   |   |   |-- page.tsx                  <-- NEW (Riepilogo Tutti gli Eventi)
|   |-- components/
|   |   |-- events/
|   |   |   |-- CreateEventButton.tsx         <-- NEW
|   |   |   |-- EventCard.tsx                 <-- NEW
|   |   |   |-- EventDashboard.tsx            <-- NEW (Client component per la dashboard mod.)
|   |   |   |-- EventList.tsx                 <-- NEW (Client component per la lista eventi)
|   |   |   |-- ProgramManager.tsx            <-- NEW (Client component per la gestione programma)
|   |   |   |-- SessionForm.tsx               <-- NEW
|   |   |   |-- StatusCard.tsx                <-- NEW
|   |-- lib/
|   |   |-- auth.ts                         <-- (Esistente, per ottenere l'utente corrente)
|   |   |-- db.ts                           <-- (Esistente, istanza del client Prisma/Drizzle)
|   |   |-- schema.ts                       <-- NEW (Definizioni Zod e tipi TypeScript)
|   |-- actions/
|   |   |-- eventActions.ts                 <-- NEW (Server Actions per gli eventi)
|   |   |-- sessionActions.ts               <-- NEW (Server Actions per le sessioni)

```

## 1. Core Definitions (Schema & Validation)

Questo file centrale definisce i tipi di dato, gli stati e gli schemi di validazione (Zod) che saranno usati sia nel frontend che nel backend, garantendo consistenza.

### `src/lib/schema.ts`

```typescript
import { z } from 'zod';

// 1. Event Statuses (come da specifiche)
export const EVENT_STATUSES = [
  'Bozza',
  'Pubblicato',
  'In Corso',
  'Completato',
  'Annullato',
  'Rinviato',
] as const;
export const EventStatusSchema = z.enum(EVENT_STATUSES);
export type EventStatus = z.infer<typeof EventStatusSchema>;

// 2. Event Types (come da specifiche)
export const EVENT_TYPES = [
  'Congresso',
  'Conferenza',
  'Workshop',
  'Fiera',
] as const;
export const EventTypeSchema = z.enum(EVENT_TYPES);
export type EventType = z.infer<typeof EventTypeSchema>;

// 3. Schema di validazione per la creazione/modifica di un evento
// Questo schema Zod verrà usato sia nel form frontend che nella Server Action backend.
export const EventFormSchema = z.object({
  name: z.string().min(3, { message: "Il nome deve contenere almeno 3 caratteri." }),
  description: z.string().optional(),
  eventType: EventTypeSchema,
  startDate: z.date({ required_error: "La data di inizio è richiesta." }),
  endDate: z.date({ required_error: "La data di fine è richiesta." }),
  location: z.string().min(3, { message: "Il luogo deve contenere almeno 3 caratteri." }),
  maxCapacity: z.coerce.number().int().positive({ message: "La capacità massima deve essere un numero positivo." }),
});

export type EventFormData = z.infer<typeof EventFormSchema>;

// 4. Schema di validazione per una sessione
export const SessionFormSchema = z.object({
  title: z.string().min(3, "Il titolo è troppo corto."),
  startTime: z.date(),
  endTime: z.date(),
  room: z.string().optional(),
  speakerId: z.string().uuid("ID relatore non valido.").optional(),
});

export type SessionFormData = z.infer<typeof SessionFormSchema>;


// 5. Tipi di dati derivati dallo schema del database (es. Prisma types)
// Questi tipi sarebbero idealmente generati automaticamente da un ORM come Prisma.
// Li definiamo qui a scopo illustrativo.

export type User = {
  id: string;
  name?: string | null;
  email: string;
};

export type Event = {
  id: string;
  name: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  location: string;
  maxCapacity: number;
  eventType: EventType;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  room?: string | null;
  eventId: string;
  speakerId?: string | null;
};

// Dati aggregati per la dashboard modale
export type EventDashboardData = {
  event: Event;
  stats: {
    participants: { confirmed: number; total: number };
    speakers: { confirmed: number; pending: number };
    program: { sessionCount: number };
  };
};

```

## 2. Backend Implementation (Next.js Server Actions)

Questi file contengono tutta la logica server-side. Usano il pattern Server Action di Next.js per la massima efficienza e sicurezza, come richiesto.

### `src/actions/eventActions.ts`

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server'; // Assumiamo di usare Clerk

import { db } from '@/lib/db'; // Importa il tuo client DB (es. Prisma)
import { EventFormSchema } from '@/lib/schema';

// --- AZIONE: Creazione di un nuovo evento ---
export async function createEvent(formData: z.infer<typeof EventFormSchema>) {
  // 1. Sicurezza: Autenticazione
  const { userId } = auth();
  if (!userId) {
    // Non dovrebbe mai accadere se la pagina è protetta dal middleware, ma è un controllo essenziale.
    return { error: 'Non autorizzato. Effettua il login per creare un evento.' };
  }

  // 2. Validazione dell'input con Zod
  const validatedFields = EventFormSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: 'Dati non validi. Controlla i campi e riprova.' };
  }
  const data = validatedFields.data;

  // 3. Logica di business
  try {
    const newEvent = await db.event.create({
      data: {
        ...data,
        status: 'Bozza', // Default status alla creazione
        // Creazione della relazione multi-admin nella tabella di join
        admins: {
          create: [{ userId: userId }],
        },
      },
    });

    // 4. Azioni post-esecuzione
    revalidatePath('/admin/events'); // Invalida la cache per la lista eventi
    // Il redirect verrà gestito qui e non nel componente
    redirect(`/admin/events/${newEvent.id}`);
  } catch (error) {
    console.error('Failed to create event:', error);
    return { error: 'Errore del database: Impossibile creare l-evento.' };
  }
}

// --- AZIONE: Recupero di tutti gli eventi per l'admin corrente ---
export async function getEvents() {
  const { userId } = auth();
  if (!userId) {
    // Se l'utente non è autenticato, non ha eventi. Restituisce un array vuoto.
    return [];
  }

  try {
    // Query sicura che filtra gli eventi tramite la tabella di join `event_admins`
    const events = await db.event.findMany({
      where: {
        admins: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    return events;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    // Lancia un errore per farlo catturare dal file error.tsx più vicino
    throw new Error('Impossibile recuperare gli eventi dal database.');
  }
}

// --- AZIONE: Recupero dati per la dashboard di un singolo evento ---
export async function getEventDashboardData(eventId: string) {
  // 1. Sicurezza: Autenticazione
  const { userId } = auth();
  if (!userId) {
    // Se l'utente non è loggato, non può accedere a nessun evento.
    return null;
  }

  // 2. Logica di business e accesso ai dati
  try {
    const event = await db.event.findFirst({
      where: {
        id: eventId,
        // 2a. Sicurezza: Autorizzazione - Controlla che l'utente sia un admin di questo evento
        admins: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        _count: {
          select: { sessions: true, participants: true },
        },
      },
    });

    // Se l'evento non viene trovato (o l'utente non ha i permessi), restituisce null.
    // La pagina che chiama questa funzione userà notFound() per mostrare un 404.
    if (!event) {
      return null;
    }

    // 3. Costruzione dell'oggetto di risposta
    const dashboardData = {
      event: event,
      stats: {
        participants: { confirmed: event._count.participants, total: event.maxCapacity },
        speakers: { confirmed: 8, pending: 2 }, // Dati mock per ora, da implementare
        program: { sessionCount: event._count.sessions },
      },
    };

    return dashboardData;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    // Lancia un errore per farlo catturare dal file error.tsx
    throw new Error('Errore del database durante il recupero dei dati della dashboard.');
  }
}

// --- AZIONE: Duplicazione di un evento (Placeholder) ---
export async function duplicateEvent(eventId: string) {
    const { userId } = auth();
    if (!userId) {
        return { error: 'Non autorizzato' };
    }
    
    // TODO: Implementare la logica complessa di duplicazione profonda (deep copy)
    // 1. Trova l'evento originale e tutte le sue relazioni (sessioni, relatori, etc.)
    // 2. Verifica che l'utente (userId) abbia i permessi per leggerlo
    // 3. Crea un nuovo evento con dati modificati (es. "Copia di [Nome Evento]")
    // 4. Ricrea tutte le entità collegate associandole al nuovo ID evento
    // 5. Associa l'utente corrente (userId) come admin del nuovo evento
    console.log(`TODO: Implementare la duplicazione per l'evento ${eventId} da parte dell'utente ${userId}`);
    
    revalidatePath('/admin/events');
    
    // Ritorna l'ID del nuovo evento per un eventuale redirect dal componente client
    return { success: true, newEventId: 'new-duplicated-id-placeholder' };
}```

### `src/actions/sessionActions.ts`

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { SessionFormSchema } from '@/lib/schema';

// --- AZIONE: Creazione di una nuova sessione per un evento ---
export async function createSession(eventId: string, formData: z.infer<typeof SessionFormSchema>) {
  // 1. Autenticazione e Autorizzazione
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Non autorizzato' };
  }

  // Verifica che l'utente sia admin di questo specifico evento
  const adminLink = await db.eventAdmin.findFirst({
    where: { eventId: eventId, userId: user.id },
  });
  if (!adminLink) {
    return { success: false, error: 'Accesso negato a questo evento.' };
  }

  // 2. Validazione
  const validatedFields = SessionFormSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { success: false, error: 'Dati del form non validi.' };
  }
  const data = validatedFields.data;

  // 3. Logica di Business: Controllo Conflitti Relatore (come da specifiche)
  if (data.speakerId) {
    const existingSession = await db.session.findFirst({
      where: {
        speakerId: data.speakerId,
        // Controlla se c'è sovrapposizione di orario
        AND: [
            { startTime: { lt: data.endTime } },
            { endTime: { gt: data.startTime } }
        ]
      },
    });

    if (existingSession) {
      // Codice di errore specifico per conflitto (409 Conflict)
      return { success: false, error: 'Conflitto di programmazione: il relatore è già occupato in questo orario.', errorCode: 'SPEAKER_CONFLICT' };
    }
  }

  // 4. Creazione nel database
  try {
    const newSession = await db.session.create({
      data: {
        ...data,
        eventId: eventId,
      },
    });

    // 5. Azioni post-esecuzione
    revalidatePath(`/admin/events/${eventId}/program`);
    return { success: true, data: newSession };
  } catch (e) {
    return { success: false, error: 'Impossibile creare la sessione.' };
  }
}
```

## 3. Frontend Implementation (Next.js & React)

Questi file rappresentano le pagine e i componenti React che l'utente vedrà e con cui interagirà. Utilizzano le Server Actions definite nella Parte 1 per recuperare e modificare i dati.

### `src/app/admin/events/page.tsx` (Riepilogo Tutti gli Eventi)

Questa è una **Server Component** che recupera i dati iniziali e passa il rendering a un componente client.

```typescript
import { getEvents } from '@/actions/eventActions';
import EventList from '@/components/events/EventList';
import CreateEventButton from '@/components/events/CreateEventButton';
import { auth } from '@clerk/nextjs/server'; // Assumiamo di usare Clerk come da guida

// Questa pagina è renderizzata sul server.
// Next.js gestirà automaticamente gli stati di caricamento ed errore
// tramite i file loading.tsx e error.tsx nella stessa cartella.
export default async function EventsDashboardPage() {
  // --> MODIFICATO: Controllo di sicurezza come prima azione.
  // Anche se il middleware protegge la rotta, è una best practice
  // validare l'identità dell'utente prima di qualsiasi accesso ai dati.
  const { userId } = auth();
  if (!userId) {
    // Questo codice viene eseguito solo se il middleware fallisce o non è configurato.
    // È una misura di sicurezza aggiuntiva.
    return (
        <div className="p-8 text-center">
            <p>Accesso negato. Effettua il login per continuare.</p>
        </div>
    );
  }

  // 1. Recupero dati server-side.
  // La chiamata è diretta, senza try/catch. Se `getEvents` lancia un errore,
  // Next.js lo intercetterà e mostrerà il contenuto di `error.tsx`.
  // Durante l'attesa (await), Next.js mostrerà `loading.tsx`.
  const events = await getEvents();

  // 2. Rendering della UI in caso di successo
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">I Tuoi Eventi</h1>
        <CreateEventButton />
      </header>
      <main>
        {/* Passaggio dati a un Client Component per la visualizzazione */}
        <EventList initialEvents={events} />
      </main>
    </div>
  );
}
```

### src/app/admin/events/loading.tsx (Mostra uno scheletro della UI durante il caricamento)
// Questo componente verrà mostrato automaticamente mentre i dati in page.tsx vengono caricati.
```typescript
export default function EventsLoading() {
  // Skeleton loader che imita la griglia delle card
  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="h-9 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mostra 3 card scheletro */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow border space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse mt-6"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### `src/components/events/EventList.tsx`

Questo componente client gestisce la visualizzazione della lista e lo stato vuoto.

```typescript
'use client';

import { Event } from '@/lib/schema';
import EventCard from './EventCard';

interface EventListProps {
  initialEvents: Event[];
}

export default function EventList({ initialEvents }: EventListProps) {
  // Se non ci sono eventi, mostra l'Empty State educational
  if (initialEvents.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg border-2 border-dashed">
        <h3 className="text-xl font-semibold text-gray-900">Nessun evento ancora creato</h3>
        <p className="mt-2 text-gray-600">
          Clicca su "Crea Nuovo Evento" per iniziare a pianificare.
        </p>
        <div className="mt-6 text-left max-w-md mx-auto bg-gray-50 p-4 rounded-md">
            <p className="font-semibold text-gray-800">Un evento include:</p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Gestione del <strong>programma</strong> e delle sessioni.</li>
                <li>Invito e coordinamento dei <strong>relatori</strong>.</li>
                <li>Iscrizione e comunicazione con i <strong>partecipanti</strong>.</li>
            </ul>
        </div>
      </div>
    );
  }

  // Se ci sono eventi, mostrali in una griglia
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

### `src/components/events/EventCard.tsx`

La card che rappresenta un singolo evento nella dashboard principale.

```typescript
'use client';

import Link from 'next/link';
import { Event, EventStatus } from '@/lib/schema';
import { Badge } from '@/components/ui/badge'; // Componente UI per il badge
import { Button } from '@/components/ui/button'; // Componente UI per il bottone
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Componente UI per la card

interface EventCardProps {
  event: Event;
}

// Funzione helper per mappare lo status a un colore (es. per Tailwind CSS)
const getStatusColor = (status: EventStatus) => {
  switch (status) {
    case 'Pubblicato':
    case 'In Corso':
      return 'bg-green-100 text-green-800';
    case 'Bozza':
      return 'bg-yellow-100 text-yellow-800';
    case 'Annullato':
      return 'bg-red-100 text-red-800';
    case 'Completato':
        return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function EventCard({ event }: EventCardProps) {
  const formattedStartDate = new Date(event.startDate).toLocaleDateString('it-IT');
  const formattedEndDate = new Date(event.endDate).toLocaleDateString('it-IT');

  return (
    <Card className="flex flex-col justify-between transition-all duration-150 ease-in-out hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-gray-900">{event.name}</CardTitle>
            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
        </div>
        <p className="text-sm text-gray-500 pt-2">
            {formattedStartDate} - {formattedEndDate}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 line-clamp-2">
            {event.description || 'Nessuna descrizione fornita.'}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/admin/events/${event.id}`}>Gestisci</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

```typescript
### src/app/admin/events/error.tsx (Mostra un messaggio d'errore se il data fetching fallisce)

'use client'; // I componenti di errore devono essere Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error;
  reset: () => void; // Funzione per tentare nuovamente il rendering della rotta
}

export default function EventsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Logga l'errore su un sistema di monitoraggio (es. Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600">Qualcosa è andato storto!</h2>
      <p className="mt-2 text-gray-700">Impossibile caricare la lista degli eventi.</p>
      <Button onClick={() => reset()} className="mt-4">
        Riprova
      </Button>
    </div>
  );
}
```

```typescript
### src/app/admin/events/[eventId]/loading.tsx 

export default function EventDashboardLoading() {
  return (
    <div className="p-8 animate-pulse">
      <header className="mb-8 space-y-3">
        <div className="h-9 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Skeleton per le StatusCard */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow border space-y-3">
            <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-8 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```typescript
### src/app/admin/events/[eventId]/error.tsx 

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps { error: Error; reset: () => void; }

export default function EventDashboardError({ error, reset }: ErrorProps) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600">Errore nel Caricamento</h2>
      <p className="mt-2 text-gray-700">Impossibile caricare i dati per questo evento.</p>
      <Button onClick={() => reset()} className="mt-4">
        Riprova
      </Button>
    </div>
  );
}
```

### `src/app/admin/events/[eventId]/page.tsx` (Dashboard Evento Modulare)

Pagina server che carica i dati aggregati per la dashboard del singolo evento.

```typescript
import { getEventDashboardData } from '@/actions/eventActions';
import { notFound } from 'next/navigation';
import EventDashboard from '@/components/events/EventDashboard';
import { Button } from '@/components/ui/button';

interface PageProps { params: { eventId: string }; }

export default async function SingleEventDashboardPage({ params }: PageProps) {
  // Il controllo di sicurezza è ora dentro getEventDashboardData,
  // che lancerà un errore o restituirà null se l'utente non ha i permessi.
  const dashboardData = await getEventDashboardData(params.eventId);

  // Se l'evento non esiste o l'utente non ha accesso, mostra 404
  if (!dashboardData) {
    notFound();
  }

  const { event, stats } = dashboardData;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
        <p className="text-lg text-gray-600">
            {new Date(event.startDate).toLocaleDateString('it-IT')} - {new Date(event.endDate).toLocaleDateString('it-IT')}
        </p>
        <div className="mt-4 flex gap-2">
            <Button variant="outline">Modifica</Button>
            <Button variant="outline">Duplica</Button>
        </div>
      </header>
      <EventDashboard event={event} initialStats={stats} />
    </div>
  );
}
```

### `src/components/events/EventDashboard.tsx`

Componente client che renderizza la griglia modulare della dashboard.

```typescript
'use client';

import { Event } from '@/lib/schema';
import StatusCard from './StatusCard';
import { Users, Calendar, Mic, DollarSign } from 'lucide-react'; // Icone

type Stats = {
    participants: { confirmed: number; total: number };
    speakers: { confirmed: number; pending: number };
    program: { sessionCount: number };
};

interface EventDashboardProps {
  event: Event;
  initialStats: Stats;
}

export default function EventDashboard({ event, initialStats }: EventDashboardProps) {
  // Qui potremmo usare TanStack Query per aggiornamenti in tempo reale
  const stats = initialStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatusCard
        icon={<Calendar />}
        title="PROGRAMMA"
        metric={`${stats.program.sessionCount} sessioni definite`}
        status="OK"
        statusText="Completo"
        linkHref={`/admin/events/${event.id}/program`}
        linkText="→ Gestisci Programma"
      />
      <StatusCard
        icon={<Mic />}
        title="RELATORI"
        metric={`${stats.speakers.confirmed} confermati, ${stats.speakers.pending} in attesa`}
        status={stats.speakers.pending > 0 ? "Warning" : "OK"}
        statusText={stats.speakers.pending > 0 ? "Attenzione" : "Tutti confermati"}
        linkText="+ Invita Relatore"
      />
      <StatusCard
        icon={<Users />}
        title="PARTECIPANTI"
        metric={`${stats.participants.confirmed} / ${event.maxCapacity} iscritti`}
        status={stats.participants.confirmed / event.maxCapacity > 0.9 ? "Error" : "OK"}
        statusText={`${(stats.participants.confirmed / event.maxCapacity * 100).toFixed(0)}% capacità`}
        linkText="→ Gestisci Iscritti"
      />
       <StatusCard
        icon={<DollarSign />}
        title="BUDGET"
        metric={`€12,500 / €15,000`}
        status="Warning"
        statusText="83% utilizzato"
        linkText="→ Gestisci Budget"
      />
      {/* ... altre card per Sponsor, Marketing, etc. */}
    </div>
  );
}
```

### `src/components/events/StatusCard.tsx`

Componente riutilizzabile per le card della dashboard modale.

```typescript
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  metric: string;
  status: 'OK' | 'Warning' | 'Error';
  statusText: string;
  linkHref?: string;
  linkText: string;
}

const statusColors = {
    OK: 'text-green-500',
    Warning: 'text-yellow-500',
    Error: 'text-red-500',
};

export default function StatusCard({ icon, title, metric, status, statusText, linkHref, linkText }: StatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
          {icon}
          <span>{title}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-gray-900">{metric}</p>
        <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${statusColors[status].replace('text-', 'bg-')}`}></span>
            <span className={`text-sm font-medium ${statusColors[status]}`}>{statusText}</span>
        </div>
        <div className="mt-4">
            {linkHref ? (
                <Button asChild variant="link" className="p-0">
                    <Link href={linkHref}>{linkText}</Link>
                </Button>
            ) : (
                <Button variant="link" className="p-0">{linkText}</Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## 4. Frontend Implementation (Wizard & Program Management)

### `src/app/admin/events/new/page.tsx` (Pagina del Wizard)

Questa pagina serve come punto di ingresso per il wizard di creazione. È una Server Component che renderizza il componente client principale del wizard.

```typescript
import EventCreationWizard from '@/components/events/EventCreationWizard';

export default function CreateEventPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Crea un Nuovo Evento</h1>
        <p className="mt-2 text-lg text-gray-600">Segui i passaggi per configurare la struttura base del tuo evento.</p>
      </header>
      <main>
        <EventCreationWizard />
      </main>
    </div>
  );
}
```

### `src/components/events/EventCreationWizard.tsx`

Questo è il cuore del wizard. È un componente client che gestisce gli step, lo stato del form con `react-hook-form` e la sottomissione alla Server Action `createEvent`.

```typescript
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EventFormData, EventFormSchema } from '@/lib/schema';
import { createEvent } from '@/actions/eventActions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner'; // Libreria per le notifiche (toast)

const TOTAL_STEPS = 3;

export default function EventCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const form = useForm<EventFormData>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      name: '',
      description: '',
      // Valori di default ragionevoli
    },
  });

  const processForm = async (data: EventFormData) => {
    startTransition(async () => {
      const result = await createEvent(data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Evento creato con successo!");
        // Il redirect è gestito dalla server action stessa
      }
    });
  };

  const nextStep = async () => {
    const fieldsToValidate = {
      1: ['name', 'eventType', 'description'],
      2: ['startDate', 'endDate', 'location'],
      3: ['maxCapacity']
    }[currentStep] as (keyof EventFormData)[];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border">
      {/* Indicatore di Step */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-gray-500">Step {currentStep} di {TOTAL_STEPS}</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm)} className="space-y-6">
          {/* Step 1: Informazioni Base */}
          <div className={currentStep === 1 ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-semibold mb-4">Informazioni Base</h2>
            {/* ... Campi per name, eventType, description ... */}
            <FormField name="name" control={form.control} render={...} />
          </div>

          {/* Step 2: Quando e Dove */}
          <div className={currentStep === 2 ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-semibold mb-4">Quando e Dove</h2>
            {/* ... Campi per startDate, endDate, location ... */}
          </div>

          {/* Step 3: Dettagli Finali */}
          <div className={currentStep === 3 ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-semibold mb-4">Capacità</h2>
             {/* ... Campo per maxCapacity ... */}
          </div>

          {/* Navigazione */}
          <div className="flex justify-between pt-6 border-t">
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" onClick={prevStep}>
                Indietro
              </Button>
            ) : <div />}

            {currentStep < TOTAL_STEPS ? (
              <Button type="button" onClick={nextStep}>
                Continua
              </Button>
            ) : (
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creazione in corso...' : 'Crea Evento e Vai alla Dashboard'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
```

### `src/app/admin/events/[eventId]/program/page.tsx` (Pagina Gestione Programma)

Questa pagina Server Component recupera i dati iniziali del programma e li passa al componente client che gestirà le interazioni.

```typescript
import { notFound } from 'next/navigation';
import { db } from '@/lib/db'; // Assumiamo esista un client DB
import ProgramManager from '@/components/events/ProgramManager';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
  params: { eventId: string };
}

// Funzione helper per recuperare i dati (sarebbe in un file actions)
async function getProgramData(eventId: string) {
    const event = await db.event.findUnique({ where: { id: eventId }});
    const sessions = await db.session.findMany({
        where: { eventId },
        orderBy: { startTime: 'asc' },
        // Include il relatore per mostrarne il nome
        include: { speaker: true } 
    });
    return { event, sessions };
}

export default async function ProgramPage({ params }: PageProps) {
  const { event, sessions } = await getProgramData(params.eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <Link href={`/admin/events/${params.eventId}`} className="text-blue-600 hover:underline text-sm">
            &larr; Torna alla Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Gestione Programma</h1>
        <p className="text-lg text-gray-600">{event.name}</p>
      </header>
      <main>
        {/* Passiamo i dati iniziali al componente client */}
        <ProgramManager eventId={params.eventId} initialSessions={sessions} />
      </main>
    </div>
  );
}
```

### `src/components/events/ProgramManager.tsx`

Componente client per la gestione del programma. Controlla l'apertura del modale per l'aggiunta di una nuova sessione e visualizza la lista/tabella delle sessioni esistenti.

```typescript
'use client';

import { useState } from 'react';
import { Session } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SessionsTable from './SessionsTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SessionForm from './SessionForm';

interface ProgramManagerProps {
  eventId: string;
  initialSessions: (Session & { speaker?: { name: string } })[];
}

export default function ProgramManager({ eventId, initialSessions }: ProgramManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Aggiungi Sessione
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea una Nuova Sessione</DialogTitle>
            </DialogHeader>
            <SessionForm eventId={eventId} onFormSubmit={() => setIsModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {initialSessions.length > 0 ? (
        <SessionsTable sessions={initialSessions} />
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-600">Nessuna sessione ancora aggiunta al programma.</p>
        </div>
      )}
    </div>
  );
}
```

### `src/components/events/SessionForm.tsx`

Il form per creare una nuova sessione, utilizzato all'interno del modale. Gestisce la validazione e la chiamata alla Server Action `createSession`, mostrando eventuali errori specifici (come il conflitto di programmazione).

```typescript
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SessionFormData, SessionFormSchema } from '@/lib/schema';
import { createSession } from '@/actions/sessionActions';
import { toast } from 'sonner';

import { Form, FormField, ... } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SessionFormProps {
  eventId: string;
  onFormSubmit: () => void; // Funzione per chiudere il modale
}

export default function SessionForm({ eventId, onFormSubmit }: SessionFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<SessionFormData>({
    resolver: zodResolver(SessionFormSchema),
  });

  const processForm = async (data: SessionFormData) => {
    startTransition(async () => {
      const result = await createSession(eventId, data);

      if (result.success) {
        toast.success("Sessione aggiunta con successo!");
        onFormSubmit(); // Chiudi il modale e revalida la pagina
      } else {
        // Gestisci l'errore di business logic specifico
        if (result.errorCode === 'SPEAKER_CONFLICT') {
            form.setError('speakerId', { type: 'custom', message: result.error });
        } else {
            toast.error(result.error);
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processForm)} className="space-y-4">
        {/*
          Qui andrebbero i vari campi del form (FormField) per:
          - title (Input)
          - startTime (DatePicker)
          - endTime (DatePicker)
          - room (Input)
          - speakerId (ComboBox/Select con ricerca per i relatori esistenti)
        */}
        <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                //... implementazione del campo
            )}
        />
        {/* ... altri campi ... */}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvataggio...' : 'Salva Sessione'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

