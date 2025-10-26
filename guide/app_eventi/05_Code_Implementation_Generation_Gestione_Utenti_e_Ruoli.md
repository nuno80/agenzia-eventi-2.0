# Code Implementation for Feature: Gestione Utenti e Ruoli

## File System Structure

```
/
|-- src/
|   |-- app/
|   |   |-- admin/
|   |   |   |-- events/
|   |   |   |   |-- [eventId]/
|   |   |   |   |   |-- participants/
|   |   |   |   |   |   |-- page.tsx          <-- NEW
|   |   |   |   |   |   |-- loading.tsx       <-- NEW
|   |   |   |   |   |   |-- error.tsx         <-- NEW
|   |   |   |   |   |-- speakers/
|   |   |   |   |   |   |-- page.tsx          <-- NEW
|   |   |-- events/
|   |   |   |-- [eventId]/
|   |   |   |   |-- register/
|   |   |   |   |   |-- page.tsx              <-- NEW (Pagina Pubblica Registrazione)
|   |-- components/
|   |   |-- participants/
|   |   |   |-- ImportModal.tsx             <-- NEW
|   |   |   |-- InviteParticipantForm.tsx   <-- NEW
|   |   |   |-- ParticipantsManager.tsx       <-- NEW (Client Component principale)
|   |   |   |-- ParticipantsTable.tsx         <-- NEW
|   |   |-- speakers/
|   |   |   |-- SpeakersManager.tsx           <-- NEW
|   |   |   |-- SpeakersTable.tsx             <-- NEW
|   |   |-- auth/
|   |   |   |-- RegistrationForm.tsx          <-- NEW (Form pubblico)
|   |-- lib/
|   |   |-- schema.ts                       <-- MODIFIED
|   |-- actions/
|   |   |-- participantActions.ts           <-- NEW
|   |   |-- jobActions.ts                   <-- NEW (Per il polling dell'importazione)
```

## 1. Core Definitions (Schema & Validation)

Aggiorniamo il file `schema.ts` per includere i nuovi stati, ruoli e schemi di validazione necessari per la gestione di partecipanti e relatori.

### `src/lib/schema.ts` (MODIFICATO)

```typescript
import { z } from 'zod';

// ... (schemi esistenti per EventStatus, EventType, EventFormSchema, etc.)

// --- NUOVE DEFINIZIONI PER GESTIONE UTENTI ---

// 1. Status dei Partecipanti
export const PARTICIPANT_STATUSES = [
  'REGISTERED',
  'WAITLISTED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'ABSENT',
] as const;
export const ParticipantStatusSchema = z.enum(PARTICIPANT_STATUSES);
export type ParticipantStatus = z.infer<typeof ParticipantStatusSchema>;

// 2. Status dei Relatori
export const SPEAKER_STATUSES = ['INVITED', 'CONFIRMED', 'DECLINED'] as const;
export const SpeakerStatusSchema = z.enum(SPEAKER_STATUSES);
export type SpeakerStatus = z.infer<typeof SpeakerStatusSchema>;

// 3. Schema di validazione per l'invito di un partecipante/relatore
export const InviteFormSchema = z.object({
  email: z.string().email({ message: 'Inserisci un indirizzo email valido.' }),
  role: z.enum(['PARTICIPANT', 'SPEAKER']),
});
export type InviteFormData = z.infer<typeof InviteFormSchema>;

// 4. Schema di validazione per il form di registrazione pubblico
export const PublicRegistrationSchema = z.object({
  name: z.string().min(2, 'Il nome è richiesto.'),
  email: z.string().email('Email non valida.'),
  password: z.string().min(8, 'La password deve contenere almeno 8 caratteri.'),
  company: z.string().optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'Devi accettare i termini e le condizioni.' }),
  }),
});
export type PublicRegistrationFormData = z.infer<typeof PublicRegistrationSchema>;


// 5. Tipi di dati derivati dal database
export type EventParticipant = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: ParticipantStatus;
  registeredAt: Date;
};

export type EventSpeaker = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: SpeakerStatus;
  bio: string | null;
};

// 6. Tipi per i Job di importazione
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type Job = {
  id: string;
  status: JobStatus;
  result: {
    successCount: number;
    errorCount: number;
    errorReportUrl?: string;
  } | null;
};
```

## 2. Backend Implementation (Next.js Server Actions)

Creiamo i nuovi file di Server Actions per gestire tutta la logica di backend: inviti, importazioni, esportazioni e stato dei job.

### `src/actions/participantActions.ts`

```typescript
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { InviteFormSchema } from '@/lib/schema';
import { NextResponse } from 'next/server';

// Funzione helper per verificare se l'utente è un admin dell'evento
async function verifyAdminAccess(eventId: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Non autorizzato');

  const adminLink = await db.eventAdmin.findFirst({
    where: { eventId, userId },
  });
  if (!adminLink) throw new Error('Accesso negato');
  return userId;
}

// --- AZIONE: Recupero della lista di partecipanti ---
export async function getParticipants(eventId: string, { page = 1, limit = 10, status, searchQuery }: { page?: number; limit?: number; status?: string; searchQuery?: string }) {
  await verifyAdminAccess(eventId);

  // Logica di paginazione e filtri
  const whereClause = {
    eventId,
    ...(status && { status }),
    ...(searchQuery && { user: { name: { contains: searchQuery, mode: 'insensitive' } } }),
  };

  const participants = await db.eventParticipant.findMany({
    where: whereClause,
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  
  const total = await db.eventParticipant.count({ where: whereClause });

  return { data: participants, total };
}

// --- AZIONE: Invito/Aggiunta manuale di un utente a un evento ---
export async function inviteParticipant(eventId: string, formData: z.infer<typeof InviteFormSchema>) {
  const userId = await verifyAdminAccess(eventId);
  
  const validatedFields = InviteFormSchema.safeParse(formData);
  if (!validatedFields.success) return { error: 'Dati non validi.' };
  
  const { email, role } = validatedFields.data;
  
  // TODO: Implementare la logica di creazione utente in Better Auth se non esiste
  // e l'invio di un'email transazionale (es. con Resend o SendGrid)
  
  if (role === 'PARTICIPANT') {
    // Aggiungi alla tabella dei partecipanti
  } else {
    // Aggiungi alla tabella dei relatori
  }

  revalidatePath(`/admin/events/${eventId}/participants`);
  revalidatePath(`/admin/events/${eventId}/speakers`);
  return { success: `Invito inviato a ${email}.` };
}

// --- AZIONE: Avvio importazione da CSV ---
export async function importFromCsv(eventId: string, formData: FormData) {
  const userId = await verifyAdminAccess(eventId);
  
  const file = formData.get('csvfile') as File;
  if (!file || file.type !== 'text/csv' || file.size > 5 * 1024 * 1024) {
    return { error: 'File non valido o troppo grande (max 5MB).' };
  }
  
  // TODO: Salvare il file su uno storage (es. S3, Vercel Blob)
  const filePath = `/path/to/saved/${file.name}`;
  
  // Crea un job nel database
  const job = await db.job.create({
    data: {
      type: 'CSV_IMPORT',
      status: 'PENDING',
      createdBy: userId,
      payload: { eventId, filePath },
    },
  });
  
  // TODO: Avviare un background worker per processare il job
  
  return { success: true, jobId: job.id };
}

// --- AZIONE: Esportazione in CSV ---
export async function exportToCsv(eventId: string) {
    await verifyAdminAccess(eventId);
    const participants = await db.eventParticipant.findMany({
        where: { eventId },
        include: { user: true },
    });

    // Logica per convertire JSON in CSV (es. con papaparse)
    const csvHeader = "Nome,Email,Stato,Data Iscrizione\n";
    const csvBody = participants.map(p => `${p.user.name},${p.user.email},${p.status},${p.registeredAt}`).join('\n');
    const csvContent = csvHeader + csvBody;

    return new NextResponse(csvContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="partecipanti_${eventId}.csv"`,
        },
    });
}
```

### `src/actions/jobActions.ts`

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// --- AZIONE: Recupero dello stato di un job di importazione ---
export async function getJobStatus(jobId: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Non autorizzato');
  
  const job = await db.job.findFirst({
    where: {
      id: jobId,
      // Sicurezza: solo l'utente che ha creato il job può vederne lo stato
      createdBy: userId, 
    },
  });

  if (!job) return null;

  return {
    status: job.status,
    result: job.result,
  };
}
```

## 3. Frontend Implementation (Pages & Components)

### `src/app/admin/events/[eventId]/participants/page.tsx`

```typescript
import { getParticipants } from '@/actions/participantActions';
import ParticipantsManager from '@/components/participants/ParticipantsManager';

interface PageProps {
  params: { eventId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ParticipantsPage({ params, searchParams }: PageProps) {
  // Parsing dei parametri di ricerca per la prima chiamata
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 10;
  
  // Carica i dati iniziali sul server
  const initialData = await getParticipants(params.eventId, { page, limit });

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Partecipanti</h1>
      </header>
      <main>
        {/* Componente client per gestire l'interattività */}
        <ParticipantsManager eventId={params.eventId} initialData={initialData} />
      </main>
    </div>
  );
}
```

### `src/components/participants/ParticipantsManager.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getParticipants } from '@/actions/participantActions';
import { EventParticipant } from '@/lib/schema';

import { Button } from '@/components/ui/button';
import ParticipantsTable from './ParticipantsTable';
import ImportModal from './ImportModal';

interface ParticipantsManagerProps {
  eventId: string;
  initialData: { data: EventParticipant[]; total: number };
}

export default function ParticipantsManager({ eventId, initialData }: ParticipantsManagerProps) {
  const [page, setPage] = useState(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // TanStack Query gestisce il data fetching, caching e re-fetching
  const { data, isLoading } = useQuery({
    queryKey: ['participants', eventId, page],
    queryFn: () => getParticipants(eventId, { page }),
    initialData: initialData,
    placeholderData: (previousData) => previousData,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* TODO: Aggiungere filtri e barra di ricerca */}
        <div className="flex gap-2">
          <Button>+ Invita Partecipante</Button>
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>Importa da CSV</Button>
          <Button variant="outline">Esporta Lista</Button>
        </div>
      </div>
      
      {isLoading ? (
        <p>Caricamento...</p>
      ) : (
        <ParticipantsTable participants={data?.data ?? []} />
      )}
      
      {/* TODO: Aggiungere paginazione */}

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        eventId={eventId}
      />
    </div>
  );
}
```

### `src/components/participants/ImportModal.tsx`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQuery } from '@tanstack/react-query';
import { importFromCsv } from '@/actions/participantActions';
import { getJobStatus } from '@/actions/jobActions';
import { JobStatus } from '@/lib/schema';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export default function ImportModal({ isOpen, onClose, eventId }: ImportModalProps) {
  const [jobId, setJobId] = useState<string | null>(null);

  // Polling dello stato del job con TanStack Query
  const { data: job, isLoading: isPolling } = useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId, // Esegui la query solo se c'è un jobId
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Interrompi il polling se il job è completato o fallito
      return status === 'COMPLETED' || status === 'FAILED' ? false : 3000;
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csvfile', file);
    
    const result = await importFromCsv(eventId, formData);
    if (result.success) {
      setJobId(result.jobId);
    } else {
      // Mostra errore
    }
  }, [eventId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

  if (!isOpen) return null;

  const renderContent = () => {
    if (jobId) {
      // Mostra lo stato del job
      return (
        <div>
          <p>Stato importazione: {job?.status ?? 'In attesa...'}</p>
          {job?.status === 'COMPLETED' && <p>Importazione completata con successo!</p>}
          {job?.status === 'FAILED' && <p>Importazione fallita.</p>}
        </div>
      );
    }
    // Mostra l'uploader
    return (
      <div {...getRootProps()} className="border-2 border-dashed p-12 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? <p>Rilascia il file qui...</p> : <p>Trascina un file CSV qui, o clicca per selezionarlo.</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-full max-w-md">
        <h3 className="text-2xl font-bold mb-4">Importa Lista da CSV</h3>
        {renderContent()}
        <button onClick={onClose} className="mt-4">Chiudi</button>
      </div>
    </div>
  );
}
```