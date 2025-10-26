# Code Implementation for Feature: Gestione_Operativa_e_Finanziaria

## File System Structure

```
/
|-- src/
|   |-- app/
|   |   |-- admin/
|   |   |   |-- events/
|   |   |   |   |-- [eventId]/
|   |   |   |   |   |-- budget/
|   |   |   |   |   |   |-- page.tsx          <-- NEW
|   |   |   |   |   |   |-- loading.tsx       <-- NEW
|   |   |   |   |   |-- sponsors/
|   |   |   |   |   |   |-- page.tsx          <-- NEW
|   |   |   |   |   |-- reimbursements/
|   |   |   |   |   |   |-- page.tsx          <-- NEW (Vista Admin)
|   |   |-- portal/
|   |   |   |-- events/
|   |   |   |   |-- [eventId]/
|   |   |   |   |   |-- reimbursements/
|   |   |   |   |   |   |-- page.tsx          <-- NEW (Vista Relatore)
|   |-- components/
|   |   |-- budget/
|   |   |   |-- BudgetDashboard.tsx         <-- NEW (Client Component principale)
|   |   |   |-- BudgetItemForm.tsx          <-- NEW
|   |   |   |-- BudgetStats.tsx             <-- NEW
|   |   |-- sponsors/
|   |   |   |-- SponsorsManager.tsx         <-- NEW
|   |   |   |-- SponsorCard.tsx             <-- NEW
|   |   |-- reimbursements/
|   |   |   |-- ReimbursementsAdminTable.tsx <-- NEW
|   |   |   |-- ReimbursementRequestForm.tsx <-- NEW (Per Relatore)
|   |   |   |-- ReimbursementsSpeakerList.tsx <-- NEW
|   |   |-- shared/
|   |   |   |-- FileUploader.tsx            <-- NEW (Componente riutilizzabile)
|   |-- lib/
|   |   |-- schema.ts                   <-- MODIFIED
|   |-- actions/
|   |   |-- budgetActions.ts            <-- NEW
|   |   |-- sponsorActions.ts           <-- NEW
|   |   |-- reimbursementActions.ts     <-- NEW
|   |   |-- fileActions.ts              <-- NEW (Per upload sicuri)
```

## 1. Core Definitions (Schema & Validation)

Aggiungiamo a `schema.ts` tutti i nuovi tipi e le validazioni per le entità finanziarie e operative.

### `src/lib/schema.ts` (MODIFICATO)

```typescript
import { z } from 'zod';

// ... (tutti gli schemi e tipi esistenti)

// --- NUOVE DEFINIZIONI PER GESTIONE OPERATIVA E FINANZIARIA ---

// 1. Schema per una voce di budget (costo/ricavo)
export const BudgetItemSchema = z.object({
  description: z.string().min(3, "La descrizione è troppo corta."),
  type: z.enum(['COST', 'REVENUE']),
  category: z.string().min(2, "La categoria è richiesta."),
  estimatedAmount: z.coerce.number().positive("L'importo preventivato deve essere positivo."),
  actualAmount: z.coerce.number().positive("L'importo effettivo deve essere positivo.").optional().nullable(),
  status: z.enum(['PENDING', 'PAID', 'RECEIVED']),
  fileUrl: z.string().url("URL del file non valido.").optional().nullable(),
});
export type BudgetItemFormData = z.infer<typeof BudgetItemSchema>;

// 2. Schema per uno sponsor
export const SponsorSchema = z.object({
  name: z.string().min(2, "Il nome dello sponsor è richiesto."),
  sponsorshipLevel: z.string().min(2, "Il livello è richiesto."),
  contributionAmount: z.coerce.number().positive("L'importo deve essere positivo."),
  status: z.enum(['PENDING', 'RECEIVED']),
  logoUrl: z.string().url().optional().nullable(),
});

// 3. Schema per una richiesta di rimborso
export const ReimbursementRequestSchema = z.object({
  amount: z.coerce.number().positive("L'importo deve essere maggiore di zero."),
  description: z.string().min(5, "Fornisci una breve descrizione della spesa."),
  receiptUrl: z.string().url("Devi allegare una ricevuta valida."),
});
export type ReimbursementRequestFormData = z.infer<typeof ReimbursementRequestSchema>;

// 4. Tipi di dati derivati dal database
export type BudgetItem = {
  id: string;
  description: string;
  type: 'COST' | 'REVENUE';
  category: string;
  estimatedAmount: number;
  actualAmount: number | null;
  status: 'PENDING' | 'PAID' | 'RECEIVED';
  fileUrl: string | null;
};

export type BudgetSummary = {
  totalEstimatedCost: number;
  totalActualCost: number;
  totalRevenue: number;
  balance: number;
  budgetConsumedPercentage: number;
};

export type Reimbursement = {
    id: string;
    amount: number;
    description: string;
    receiptUrl: string;
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'PAID';
    requestedAt: Date;
    speaker: {
        user: { name: string | null }
    };
};
```

## 2. Backend Implementation (Next.js Server Actions)

### `src/actions/budgetActions.ts`

```typescript
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { BudgetItemSchema } from '@/lib/schema';
import { verifyAdminAccess } from './utils'; // Assumiamo un helper centralizzato

// --- AZIONE: Recupero dati completi del budget ---
export async function getBudget(eventId: string) {
  await verifyAdminAccess(eventId);
  
  const lineItems = await db.budgetItem.findMany({ where: { eventId } });

  // Calcola i dati aggregati sul server
  const summary = lineItems.reduce((acc, item) => {
    if (item.type === 'COST') {
      acc.totalEstimatedCost += item.estimatedAmount;
      acc.totalActualCost += item.actualAmount ?? 0;
    } else {
      acc.totalRevenue += item.actualAmount ?? item.estimatedAmount;
    }
    return acc;
  }, { totalEstimatedCost: 0, totalActualCost: 0, totalRevenue: 0 });

  const balance = summary.totalRevenue - summary.totalActualCost;
  const budgetConsumedPercentage = summary.totalEstimatedCost > 0 
    ? (summary.totalActualCost / summary.totalEstimatedCost) * 100 
    : 0;

  return { 
    lineItems, 
    summary: { ...summary, balance, budgetConsumedPercentage: Math.round(budgetConsumedPercentage) } 
  };
}

// --- AZIONE: Aggiunta di una voce di budget ---
export async function createBudgetItem(eventId: string, formData: z.infer<typeof BudgetItemSchema>) {
  await verifyAdminAccess(eventId);
  
  const validatedFields = BudgetItemSchema.safeParse(formData);
  if (!validatedFields.success) return { error: 'Dati non validi.' };
  
  await db.budgetItem.create({ data: { eventId, ...validatedFields.data } });
  
  revalidatePath(`/admin/events/${eventId}/budget`);
  return { success: 'Voce di budget aggiunta.' };
}
```

### `src/actions/reimbursementActions.ts`

```typescript
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ReimbursementRequestSchema } from '@/lib/schema';
import { verifyAdminAccess, verifySpeakerAccess } from './utils';

// --- AZIONE: Creazione richiesta di rimborso (Relatore) ---
export async function createReimbursementRequest(eventId: string, formData: z.infer<typeof ReimbursementRequestSchema>) {
  const speakerLink = await verifySpeakerAccess(eventId); // Verifica che l'utente sia un relatore dell'evento

  const validatedFields = ReimbursementRequestSchema.safeParse(formData);
  if (!validatedFields.success) return { error: 'Dati del form non validi.' };

  await db.reimbursement.create({
    data: {
      eventId,
      speakerId: speakerLink.id,
      status: 'PENDING',
      requestedAt: new Date(),
      ...validatedFields.data,
    },
  });

  revalidatePath(`/portal/events/${eventId}/reimbursements`);
  return { success: 'Richiesta di rimborso inviata con successo.' };
}

// --- AZIONE: Recupero richieste di rimborso (Logica condizionale per Admin/Relatore) ---
export async function getReimbursements(eventId: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Non autorizzato');
  
  const userRole = await getUserRoleForEvent(eventId, userId); // Funzione helper da creare

  let whereClause: any = { eventId };
  if (userRole === 'SPEAKER') {
    whereClause.speaker = { userId };
  } else if (userRole !== 'ADMIN') {
    return []; // Se non è né admin né speaker, non può vedere nulla
  }

  return db.reimbursement.findMany({
    where: whereClause,
    include: { speaker: { include: { user: { select: { name: true } } } } },
    orderBy: { requestedAt: 'desc' },
  });
}

// --- AZIONE: Aggiornamento stato rimborso (Admin) ---
export async function updateReimbursementStatus(eventId: string, reimbursementId: string, status: 'APPROVED' | 'DECLINED') {
  await verifyAdminAccess(eventId);
  
  await db.reimbursement.update({
    where: { id: reimbursementId },
    data: { status },
  });

  revalidatePath(`/admin/events/${eventId}/reimbursements`);
  // Opzionale: revalidare anche la vista del relatore se si vuole notifica immediata
  // revalidatePath(`/portal/events/[eventId]/reimbursements`); 
  return { success: `Richiesta ${status === 'APPROVED' ? 'approvata' : 'rifiutata'}.` };
}
```

### `src/actions/fileActions.ts`

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
// import { put } from '@vercel/blob'; // Esempio con Vercel Blob

// --- AZIONE: Upload di un file generico ---
export async function uploadFile(formData: FormData) {
  const { userId } = auth();
  if (!userId) return { error: 'Non autorizzato' };

  const file = formData.get('file') as File;
  if (!file) return { error: 'Nessun file fornito.' };
  
  // Sicurezza: validare tipo e dimensione
  if (file.size > 10 * 1024 * 1024) { // 10MB
      return { error: 'File troppo grande.' };
  }

  // TODO: Logica di upload su un servizio di storage (es. Vercel Blob, S3)
  // const blob = await put(file.name, file, { access: 'public' });
  // return { success: true, url: blob.url };
  
  // Ritorno un URL di placeholder per lo sviluppo
  return { success: true, url: `https://example.com/uploads/${file.name}` };
}
```

## 3. Frontend Implementation (Pages & Components)

### `src/app/admin/events/[eventId]/budget/page.tsx`

```typescript
import { getBudget } from '@/actions/budgetActions';
import BudgetDashboard from '@/components/budget/BudgetDashboard';

interface PageProps { params: { eventId: string } }

export default async function BudgetPage({ params }: PageProps) {
  // Carica i dati iniziali sul server
  const initialData = await getBudget(params.eventId);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestione Budget</h1>
      </header>
      <main>
        {/* Componente client per l'interattività */}
        <BudgetDashboard eventId={params.eventId} initialData={initialData} />
      </main>
    </div>
  );
}
```

### `src/components/budget/BudgetDashboard.tsx`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudget, createBudgetItem } from '@/actions/budgetActions';
import { BudgetItem } from '@/lib/schema';

import BudgetStats from './BudgetStats';
// import BudgetTable from './BudgetTable';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
// import BudgetItemForm from './BudgetItemForm';

interface BudgetDashboardProps {
  eventId: string;
  initialData: { lineItems: BudgetItem[], summary: any };
}

export default function BudgetDashboard({ eventId, initialData }: BudgetDashboardProps) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['budget', eventId],
    queryFn: () => getBudget(eventId),
    initialData: initialData,
  });

  const mutation = useMutation({
    mutationFn: (newItem: any) => createBudgetItem(eventId, newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', eventId] });
      setIsModalOpen(false);
      // toast.success(...)
    },
  });

  if (isLoading) return <p>Caricamento dati budget...</p>;
  if (!data) return <p>Nessun dato trovato.</p>;

  return (
    <div className="space-y-6">
      <BudgetStats summary={data.summary} />
      
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>+ Aggiungi Voce</Button>
      </div>

      {/* <BudgetTable items={data.lineItems} /> */}
      <p>Tabella delle voci di budget qui...</p>

      {/* {isModalOpen && <BudgetItemForm onSubmit={mutation.mutate} onClose={() => setIsModalOpen(false)} />} */}
    </div>
  );
}
```

### `src/app/portal/events/[eventId]/reimbursements/page.tsx` (Vista Relatore)

```typescript
import { getReimbursements } from '@/actions/reimbursementActions';
import ReimbursementRequestForm from '@/components/reimbursements/ReimbursementRequestForm';
import ReimbursementsSpeakerList from '@/components/reimbursements/ReimbursementsSpeakerList';

interface PageProps { params: { eventId: string } }

export default async function SpeakerReimbursementsPage({ params }: PageProps) {
  const requests = await getReimbursements(params.eventId);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Le Tue Richieste di Rimborso</h1>
        {/* Il form sarà in un modale triggerato da un bottone qui */}
      </div>
      <div className="space-y-6">
        <ReimbursementRequestForm eventId={params.eventId} />
        <ReimbursementsSpeakerList requests={requests} />
      </div>
    </div>
  );
}
```