# Feature Slice: Gestione e Configurazione Eventi

## 1. High-Fidelity UI/UX Design

### Screen: Admin Dashboard (Riepilogo Tutti gli Eventi)
#### **Description & UX**
*   **User Goal:** Avere una visione d'insieme di tutti gli eventi creati e accedere rapidamente alla dashboard di un evento specifico o crearne uno nuovo.
*   **UI Details:** La schermata presenta un titolo **H1** ("I Tuoi Eventi"). Sotto, un bottone **Primary** prominente con icona Lucide `Plus` per "Crea Nuovo Evento". Se non ci sono eventi, viene mostrato un **Empty State** informativo come definito nel Design System. Se ci sono eventi, vengono visualizzati come una griglia di **Card Standard**, ognuna con il nome dell'evento (**H3**), le date (**Small**), uno status badge e un bottone **Secondary** "Gestisci".
*   **Animations:** Al passaggio del mouse, le card hanno una leggera ombra più pronunciata e si sollevano leggermente (transizione **Standard** di 150ms). Il bottone "Crea Nuovo Evento" ha un leggero ingrandimento al passaggio del mouse.
*   **Color & Typography:** Sfondo `Background (#f9fafb)`. Titolo in `gray-900`. Le card usano sfondo `Surface (#ffffff)`. I bottoni seguono la palette definita.

### Screen: Wizard di Creazione Evento (Multi-Step)
#### **Description & UX**
*   **User Goal:** Creare la struttura base di un nuovo evento in pochi, semplici passaggi, senza sentirsi sopraffatto dalle opzioni.
*   **UI Details:** Un modale o una vista a pagina intera con un indicatore di step in alto (es. "Step 1 di 3"). Ogni step ha un titolo **H2** chiaro (es. "Informazioni Base dell'Evento"). I campi sono **Input Fields** standard, con label in stile **Small**. La navigazione avviene tramite bottoni "Indietro" (**Secondary**) e "Continua" (**Primary**). L'ultimo step ha un bottone "Crea Evento e Vai alla Dashboard".
*   **Animations:** Il passaggio da uno step all'altro ha una transizione a scorrimento orizzontale (transizione **Emphasis** di 250ms) per dare un senso di progressione.
*   **Color & Typography:** I titoli usano `gray-900`. I campi del form seguono lo stile definito, con il bordo che diventa `Primary Blue` quando attivo. I bottoni usano i colori `Primary` e `Secondary`.

### Screen: Dashboard Evento Modulare
#### **Description & UX**
*   **User Goal:** Monitorare lo stato di avanzamento di un singolo evento a colpo d'occhio e accedere rapidamente alle sezioni di gestione dettagliata.
*   **UI Details:** La pagina è dominata da un'intestazione con il nome dell'evento (**H1**), le date (**Body**) e azioni rapide (Modifica, Duplica). Sotto, una griglia responsive (2 colonne su tablet, 3-4 su desktop) di **Card Standard**. Ogni card rappresenta un modulo (Programma, Relatori, Partecipanti, etc.) e contiene:
    *   Un titolo **Caption** (es. "👤 RELATORI").
    *   Un indicatore di stato visivo (icona + colore) e testuale (es. `⚠️ Attenzione`).
    *   Una metrica chiave in stile **Small** (es. "28 confermati, 2 in attesa risposta").
    *   Bottoni di azione rapida (es. "+ Invita relatore", "→ Gestisci").
*   **Animations:** Le metriche numeriche possono avere una sottile animazione di conteggio al caricamento della pagina. I bottoni seguono le microinterazioni definite (150ms).
*   **Color & Typography:** I colori degli indicatori di stato usano la palette funzionale (`Success Green`, `Warning Orange`, etc.). La tipografia segue la gerarchia definita per garantire la massima chiarezza.

### Screen: Gestione Programma
#### **Description & UX**
*   **User Goal:** Definire nel dettaglio il programma dell'evento, aggiungendo, modificando e organizzando le singole sessioni.
*   **UI Details:** La pagina mostra le sessioni in una tabella (su desktop) o una lista di card (su mobile). La tabella ha colonne per Titolo, Orario, Sala, Relatore e Azioni (Modifica, Elimina). Un bottone **Primary** "+ Aggiungi Sessione" apre un modale o un pannello laterale con un form per inserire i dettagli della nuova sessione.
*   **Error States:** Se si tenta di creare una sessione con un relatore già occupato in quell'orario, appare un modale di **Errore di Business Logic** che spiega il conflitto.

## 2. Technical Specification

### A. System & API Design
#### **Server Actions / API Endpoints**
*   `POST createEvent(data)`
    *   **Description:** Crea un nuovo evento nel database. Azione eseguita al termine del wizard.
    *   **Request Body:** `Zod schema` con `name`, `description`, `startDate`, `endDate`, `location`, `maxCapacity`.
    *   **Success Response:** `200 OK` con l'ID del nuovo evento e reindirizzamento a `/admin/events/[eventId]`.
    *   **Error Responses:** `400 Bad Request` (dati non validi), `403 Forbidden` (utente non autorizzato).
*   `GET getEvents()`
    *   **Description:** Recupera la lista di tutti gli eventi associati all'admin autenticato.
    *   **Request Body:** Nessuno.
    *   **Success Response:** `200 OK` con un array di oggetti evento.
*   `GET getEventDashboardData(eventId)`
    *   **Description:** Recupera tutti i dati aggregati necessari per la Dashboard Evento Modulare (conteggio partecipanti, stato relatori, etc.).
    *   **Request Body:** Nessuno.
    *   **Success Response:** `200 OK` con un oggetto complesso contenente tutte le statistiche.
*   `POST createSession(eventId, data)`
    *   **Description:** Aggiunge una nuova sessione al programma di un evento.
    *   **Request Body:** `Zod schema` con `title`, `startTime`, `endTime`, `room`, `speakerId`.
    *   **Success Response:** `200 OK` con i dati della nuova sessione.
    *   **Error Responses:** `400 Bad Request`, `409 Conflict` (conflitto di programmazione).

### B. Database Schema
*   **Tabella `events`**
    *   `id`: `string` (UUID, primary key)
    *   `name`: `string`
    *   `description`: `text` (opzionale)
    *   `startDate`: `datetime`
    *   `endDate`: `datetime`
    *   `location`: `string`
    *   `maxCapacity`: `integer`
    *   `adminId`: `string` (foreign key alla tabella `users`)
    *   `createdAt`: `datetime`
    *   `updatedAt`: `datetime`
*   **Tabella `sessions`**
    *   `id`: `string` (UUID, primary key)
    *   `title`: `string`
    *   `startTime`: `datetime`
    *   `endTime`: `datetime`
    *   `room`: `string` (opzionale)
    *   `eventId`: `string` (foreign key a `events.id`)
    *   `speakerId`: `string` (foreign key a `speakers.id`, opzionale)

### C. Frontend Architecture
*   **State Management:**
    *   **Wizard di Creazione**: Gestito localmente con `useState` o `useReducer` per i dati del form multi-step. Per form più complessi si utilizzerà `react-hook-form` con validazione Zod.
    *   **Dati Dashboard**: Gestiti tramite una libreria di data-fetching come **TanStack Query (React Query)** per gestire caching, invalidazione automatica (dopo aver aggiunto una sessione) e stati di caricamento/errore.
*   **Routing (Next.js App Router):**
    *   `/admin/events`: Pagina con la lista di tutti gli eventi.
    *   `/admin/events/new`: Pagina (o rotta intercettata per un modale) per il wizard di creazione.
    *   `/admin/events/[eventId]`: La Dashboard Evento Modulare.
    *   `/admin/events/[eventId]/program`: La pagina di gestione del programma.
*   **Component Hierarchy:**
    *   `app/admin/events/page.tsx` (Lista Eventi)
        *   `EventCard.tsx`
        *   `CreateEventButton.tsx`
    *   `app/admin/events/[eventId]/page.tsx` (Dashboard Modulare)
        *   `EventHeader.tsx`
        *   `StatusCard.tsx` (Componente riutilizzabile per Programma, Relatori, etc.)
    *   `app/admin/events/[eventId]/program/page.tsx` (Gestione Programma)
        *   `SessionsTable.tsx`
        *   `SessionForm.tsx` (in un modale o pannello laterale)

### D. Security Considerations
*   **Autorizzazione**: Tutte le Server Actions e API routes devono verificare che l'utente sia autenticato e abbia il ruolo di 'Admin'.
*   **Controllo Accesso**: Ogni query al database per dati di un evento (es. `getEventDashboardData`) deve includere una clausola `WHERE adminId = currentUser.id` per prevenire che un admin possa vedere o modificare eventi di altri.
*   **Validazione Input**: Tutti i dati provenienti dai form devono essere validati server-side usando Zod prima di essere inseriti nel database, per prevenire XSS e altri attacchi di injection.

### E. Testing Strategy
*   **Unit Tests (Jest/Vitest + React Testing Library):**
    *   Testare la logica di validazione del form del wizard.
    *   Testare il rendering condizionale dei `StatusCard` in base ai dati ricevuti.
    *   Testare l'empty state della lista eventi.
*   **Integration Tests:**
    *   Testare l'intero flusso di creazione evento, mockando le Server Actions, per assicurarsi che lo stato del frontend si aggiorni correttamente.
    *   Testare che l'aggiunta di una nuova sessione invalidi correttamente la cache di React Query e aggiorni la UI.
*   **E2E Tests (Playwright/Cypress):**
    *   Uno script simulerà un admin che effettua il login, naviga a `/admin/events`, clicca "Crea Nuovo Evento", completa il wizard, viene reindirizzato alla dashboard, naviga nella sezione "Programma" e aggiunge con successo una nuova sessione.