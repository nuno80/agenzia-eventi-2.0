# Code_Implementation_Feedback_e_Dati.md

## File System Structure

```
/
|-- src/
|   |-- app/
|   |   |-- admin/
|   |   |   |-- events/
|   |   |   |   |-- [eventId]/
|   |   |   |   |   |-- surveys/
|   |   |   |   |   |   |-- builder/
|   |   |   |   |   |   |   |-- page.tsx      <-- NEW (Form Builder)
|   |   |   |   |   |   |-- results/
|   |   |   |   |   |   |   |-- page.tsx      <-- NEW (Visualizzazione Risultati)
|   |   |   |   |   |   |   |-- loading.tsx   <-- NEW
|   |-- portal/
|   |   |   |-- events/
|   |   |   |   |-- [eventId]/
|   |   |   |   |   |-- survey/
|   |   |   |   |   |   |-- page.tsx          <-- NEW (Compilazione Questionario)
|   |-- components/
|   |   |-- surveys/
|   |   |   |-- FormBuilder.tsx             <-- NEW (Client Component per il builder D&D)
|   |   |   |-- QuestionEditor.tsx          <-- NEW (Componente per modificare una domanda)
|   |   |   |-- SurveyRenderer.tsx          <-- NEW (Client Component per renderizzare e compilare il form)
|   |   |   |-- ResultsDashboard.tsx        <-- NEW (Client Component per visualizzare grafici)
|   |   |   |-- ChartPlaceholder.tsx        <-- NEW (Placeholder per i grafici)
|   |-- lib/
|   |   |-- schema.ts                   <-- MODIFIED
|   |-- actions/
|   |   |-- surveyActions.ts            <-- NEW
|   |   |-- reportActions.ts            <-- NEW
```

## 1. Core Definitions (Schema & Validation)

Estendiamo `schema.ts` per definire la struttura dei questionari e delle risposte, garantendo la validazione dei dati a ogni livello.

### `src/lib/schema.ts` (MODIFICATO)

```typescript
import { z } from 'zod';

// ... (tutti gli schemi e tipi esistenti)

// --- NUOVE DEFINIZIONI PER FEEDBACK E DATI ---

// 1. Schema per una singola domanda del questionario
export const SurveyQuestionSchema = z.object({
  id: z.string().cuid(), // CUID per ID univoci generati sul client
  type: z.enum(['TEXT', 'MULTIPLE_CHOICE', 'LINEAR_SCALE']),
  label: z.string().min(1, "La domanda non può essere vuota."),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
});

// 2. Schema per la struttura completa del questionario
export const SurveyStructureSchema = z.object({
  title: z.string().min(1, "Il titolo è richiesto."),
  questions: z.array(SurveyQuestionSchema),
  settings: z.object({
    activeAfterEventHours: z.coerce.number().int().positive().optional(),
  }),
});
export type SurveyStructure = z.infer<typeof SurveyStructureSchema>;

// 3. Schema per l'invio di una risposta
export const SurveyResponseSchema = z.object({
  answers: z.record(z.string(), z.any()), // Record<questionId, answerValue>
});
```

## 2. Backend Implementation (Next.js Server Actions)

### `src/actions/surveyActions.ts`

```typescript
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { SurveyStructureSchema } from '@/lib/schema';
import { verifyAdminAccess, verifyParticipantAccess } from './utils'; // Assumiamo helper centralizzati

// --- AZIONE: Creazione o aggiornamento di un questionario (Admin) ---
export async function createOrUpdateSurvey(eventId: string, structure: z.infer<typeof SurveyStructureSchema>) {
  await verifyAdminAccess(eventId);

  const validatedStructure = SurveyStructureSchema.safeParse(structure);
  if (!validatedStructure.success) return { error: 'Struttura del questionario non valida.' };
  
  await db.survey.upsert({
    where: { eventId },
    update: { ...validatedStructure.data },
    create: { eventId, ...validatedStructure.data },
  });

  revalidatePath(`/admin/events/${eventId}/surveys/builder`);
  return { success: 'Questionario salvato con successo.' };
}

// --- AZIONE: Recupero della struttura del questionario (Partecipante) ---
export async function getSurveyForParticipant(eventId: string) {
  await verifyParticipantAccess(eventId); // Verifica che l'utente sia un partecipante dell'evento
  
  // Verifica se l'utente ha già risposto
  // const existingResponse = await db.surveyResponse.findFirst(...)
  // if (existingResponse) return { alreadySubmitted: true };

  const survey = await db.survey.findUnique({ where: { eventId } });
  return survey;
}

// --- AZIONE: Invio delle risposte (Partecipante) ---
export async function submitSurveyResponse(eventId: string, surveyId: string, answers: Record<string, any>) {
  const participantLink = await verifyParticipantAccess(eventId);
  
  // TODO: Verificare che il partecipante non abbia già risposto

  await db.surveyResponse.create({
    data: {
      surveyId,
      participantId: participantLink.id,
      answers,
      submittedAt: new Date(),
    },
  });

  revalidatePath(`/admin/events/${eventId}/surveys/results`);
  return { success: 'Grazie per il tuo feedback!' };
}

// --- AZIONE: Recupero dei risultati del questionario (Admin) ---
export async function getSurveyResults(eventId: string) {
  await verifyAdminAccess(eventId);
  
  const survey = await db.survey.findUnique({ 
    where: { eventId },
    include: { responses: true },
  });

  if (!survey) return null;

  // TODO: Logica di aggregazione complessa per preparare i dati per i grafici
  const aggregatedResults = {
    totalResponses: survey.responses.length,
    // ... dati per ogni domanda
  };

  return {
    surveyTitle: survey.title,
    aggregatedResults,
    individualResponses: survey.responses,
  };
}
```

### `src/actions/reportActions.ts`

```typescript
'use server';

import { NextResponse } from 'next/server';
import { getBudget } from './budgetActions';
import { verifyAdminAccess } from './utils';
// import ExcelJS from 'exceljs'; // Libreria per generare file Excel

// --- AZIONE: Generazione report budget (Admin) ---
export async function generateBudgetReport(eventId: string, format: 'xlsx' | 'pdf') {
  await verifyAdminAccess(eventId);
  const budgetData = await getBudget(eventId);

  if (format === 'xlsx') {
    // TODO: Logica di generazione del file Excel con ExcelJS
    // 1. Crea un nuovo Workbook
    // 2. Aggiungi un Worksheet
    // 3. Popola le celle con i dati da budgetData.summary e budgetData.lineItems
    // 4. Scrivi il buffer del file
    const buffer = Buffer.from('Contenuto del file Excel di esempio'); // Placeholder

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="report_budget_${eventId}.xlsx"`,
      },
    });
  }

  // TODO: Logica per il PDF (più complessa, es. con Puppeteer)
  return new NextResponse('Formato non supportato', { status: 400 });
}
```

## 3. Frontend Implementation (Pages & Components)

### `src/app/admin/events/[eventId]/surveys/builder/page.tsx`

```typescript
import { db } from '@/lib/db'; // Accesso diretto per la pagina server
import FormBuilder from '@/components/surveys/FormBuilder';

interface PageProps { params: { eventId: string } }

export default async function SurveyBuilderPage({ params }: PageProps) {
  // Carica la struttura esistente del questionario, se presente
  const existingSurvey = await db.survey.findUnique({
    where: { eventId: params.eventId },
  });

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Crea Questionario di Feedback</h1>
      </header>
      <main>
        {/* Componente client per tutta la logica interattiva del builder */}
        <FormBuilder eventId={params.eventId} initialSurvey={existingSurvey} />
      </main>
    </div>
  );
}
```

### `src/components/surveys/FormBuilder.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createOrUpdateSurvey } from '@/actions/surveyActions';
import { SurveyStructure } from '@/lib/schema';
// import { DndContext } from '@dnd-kit/core'; // Esempio di libreria D&D

interface FormBuilderProps {
  eventId: string;
  initialSurvey: SurveyStructure | null;
}

const defaultSurvey: SurveyStructure = {
  title: 'Feedback sull\'evento',
  questions: [],
  settings: {},
};

export default function FormBuilder({ eventId, initialSurvey }: FormBuilderProps) {
  const [survey, setSurvey] = useState<SurveyStructure>(initialSurvey || defaultSurvey);

  const { mutate: saveSurvey, isPending } = useMutation({
    mutationFn: (updatedSurvey: SurveyStructure) => createOrUpdateSurvey(eventId, updatedSurvey),
    onSuccess: (data) => {
      if (data.success) { /* toast.success(data.success) */ } 
      else { /* toast.error(data.error) */ }
    },
  });

  const handleSave = () => {
    saveSurvey(survey);
  };
  
  // TODO: Implementare funzioni per aggiungere, rimuovere, modificare e riordinare domande
  // che aggiornano lo stato 'survey'. Esempio:
  // const addQuestion = (type) => {
  //   const newQuestion = { id: cuid(), type, label: '', required: false };
  //   setSurvey(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  // };

  return (
    <div>
      {/* 
        Qui andrebbe l'interfaccia complessa del builder:
        - Un pannello laterale con i tipi di domande da trascinare.
        - L'area principale dove le domande vengono renderizzate e possono essere modificate.
        - Uso di una libreria come dnd-kit per il drag and drop.
      */}
      <p className="text-center p-12 border-2 border-dashed">
        Area del Form Builder (con logica Drag & Drop e modifica inline)
      </p>

      <div className="mt-8 flex justify-end">
        <button onClick={handleSave} disabled={isPending} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          {isPending ? 'Salvataggio...' : 'Salva Questionario'}
        </button>
      </div>
    </div>
  );
}
```

### `src/app/portal/events/[eventId]/survey/page.tsx` (Compilazione)

```typescript
import { getSurveyForParticipant } from '@/actions/surveyActions';
import SurveyRenderer from '@/components/surveys/SurveyRenderer';

interface PageProps { params: { eventId: string } }

export default async function FillSurveyPage({ params }: PageProps) {
  const surveyData = await getSurveyForParticipant(params.eventId);

  // if (surveyData?.alreadySubmitted) {
  //   return <p>Hai già compilato questo questionario. Grazie!</p>;
  // }
  
  if (!surveyData) {
    return <p>Nessun questionario disponibile per questo evento.</p>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8 flex justify-center items-center">
      <div className="w-full max-w-2xl">
        <SurveyRenderer survey={surveyData} eventId={params.eventId} />
      </div>
    </div>
  );
}
```