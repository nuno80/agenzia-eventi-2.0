# Feature Slice: Gestione Utenti e Ruoli

## 1. High-Fidelity UI/UX Design

### Screen: Gestione Partecipanti (Vista Admin)
#### **Description & UX**
*   **User Goal:** Avere il pieno controllo sulla lista dei partecipanti di un evento: visualizzare, filtrare, aggiungere, importare ed esportare dati con efficienza.
*   **UI Details:** La pagina presenta un titolo **H2** ("Partecipanti"). Un'area di azioni in alto contiene bottoni **Primary** ("+ Invita Partecipante") e **Secondary** ("Importa da CSV", "Esporta Lista"). Sotto, una barra di ricerca e filtri per stato (Iscritto, Presente, etc.). Il contenuto principale è una **Tabella** (o una lista di **Card** su mobile) con colonne per Nome, Email, Stato (un "badge" con colore e testo), Data Iscrizione e Azioni (Modifica, Elimina).
*   **Animations:** L'hover sulle righe della tabella le evidenzia con un colore di sfondo `gray-100` (transizione **Standard** 150ms). I modali per l'aggiunta o l'importazione appaiono con una transizione di enfasi (250ms).
*   **Color & Typography:** I badge di stato usano i colori funzionali: `Primary Blue` per Iscritto, `Success Green` per Presente, `Warning Orange` per Lista d'attesa, `Error Red` per Assente. La tipografia della tabella segue lo stile definito per chiarezza e leggibilità.

### Screen: Modale di Importazione Massiva (CSV)
#### **Description & UX**
*   **User Goal:** Aggiungere un gran numero di partecipanti o relatori in una sola volta, senza doverli inserire manualmente.
*   **UI Details:** Un modale con un titolo **H3** ("Importa Lista da CSV"). Contiene un'area per il drag-and-drop del file, un link per scaricare un template CSV e istruzioni chiare sul formato richiesto. Durante l'upload, una barra di progresso mostra lo stato. Al termine, un riepilogo mostra i risultati (es. "57 utenti importati con successo, 3 righe ignorate per errori."). Un link permette di scaricare un report degli errori.
*   **Error States:** Se il file ha un formato errato, un messaggio di **Errore di Validazione** appare immediatamente. Le righe con errori (es. email non valida) vengono segnalate nel report scaricabile.
*   **Color & Typography:** La UI dell'uploader è pulita e funzionale. La barra di progresso usa `Primary Blue`. I messaggi di successo e errore usano i rispettivi colori funzionali.

### Screen: Gestione Relatori (Vista Admin)
#### **Description & UX**
*   **User Goal:** Gestire la lista dei relatori, monitorare chi ha accettato l'invito e associare i relatori alle sessioni.
*   **UI Details:** Struttura molto simile alla Gestione Partecipanti per coerenza. La tabella, però, ha colonne diverse: Nome, Email, Stato Invito (`Invitato`, `Confermato`), Sessioni Assegnate e Azioni.
*   **Color & Typography:** I badge di stato per i relatori useranno `Warning Orange` per "Invitato" e `Success Green` per "Confermato".

### Screen: Portale Pubblico - Form di Registrazione
#### **Description & UX**
*   **User Goal:** Un potenziale partecipante vuole iscriversi a un evento pubblico in modo semplice e veloce.
*   **UI Details:** Un form pulito, inserito nella pagina dell'evento. Campi richiesti: Nome, Cognome, Email, Password. Campi opzionali possono includere Azienda o Ruolo. Includerà checkbox obbligatori per l'accettazione di Termini & Condizioni e Privacy Policy. Il bottone di submit è un **Primary** button con testo chiaro "Registrati all'Evento".
*   **Error States:** La validazione inline mostra errori sotto ogni campo (es. "Email non valida") come definito nel Design System.

## 2. Technical Specification

### A. System & API Design
#### **Server Actions / API Endpoints**
*   `GET /events/[eventId]/participants`
    *   **Description:** Recupera la lista paginata e filtrabile dei partecipanti per un dato evento.
    *   **Query Params:** `page`, `limit`, `status`, `searchQuery`.
    *   **Success Response:** `200 OK` con un array di oggetti partecipante e metadati di paginazione.
*   `POST /events/[eventId]/participants/invite`
    *   **Description:** Invia un'email di invito a un nuovo potenziale partecipante o relatore, generando un token di registrazione univoco.
    *   **Request Body:** `{"email": "...", "role": "PARTICIPANT" | "SPEAKER"}`.
    *   **Success Response:** `202 Accepted`.
*   `POST /events/[eventId]/participants`
    *   **Description:** Aggiunge manualmente un partecipante a un evento.
    *   **Request Body:** `{"name": "...", "email": "..."}`.
    *   **Success Response:** `201 Created` con i dati del nuovo partecipante.
*   `POST /events/[eventId]/participants/import`
    *   **Description:** Avvia un processo di importazione massiva da un file CSV. **Questa azione avvierà un background job**.
    *   **Request Body:** `FormData` con il file CSV.
    *   **Success Response:** `202 Accepted` con un `jobId` per tracciare lo stato dell'importazione.
*   `GET /jobs/[jobId]/status`
    *   **Description:** Recupera lo stato di un'importazione in corso (es. "processing", "completed", "failed").
    *   **Success Response:** `200 OK` con lo stato e i risultati (se completato).
*   `GET /events/[eventId]/participants/export`
    *   **Description:** Genera e restituisce un file CSV con la lista dei partecipanti.
    *   **Success Response:** `200 OK` con `Content-Type: text/csv`.

### B. Database Schema
*   **Tabella `users`**
    *   Sarà utilizzata la tabella `users` di Better Auth. Si aggiungerà un campo `role`: `enum` (`ADMIN`, `STAFF`, `USER`). Il ruolo `USER` è generico; il ruolo specifico in un evento è definito nelle tabelle di join.
    *   Campi aggiuntivi: `name`, `company` (opzionale).
*   **Tabella `event_participants` (Join Table)**
    *   `id`: `string` (UUID, primary key)
    *   `eventId`: `string` (foreign key a `events.id`)
    *   `userId`: `string` (foreign key a `users.id`)
    *   `status`: `enum` (`REGISTERED`, `WAITLISTED`, `CHECKED_IN`, `CHECKED_OUT`, `ABSENT`)
    *   `registeredAt`: `datetime`
*   **Tabella `event_speakers` (Join Table)**
    *   `id`: `string` (UUID, primary key)
    *   `eventId`: `string` (foreign key a `events.id`)
    *   `userId`: `string` (foreign key a `users.id`)
    *   `status`: `enum` (`INVITED`, `CONFIRMED`, `DECLINED`)
    *   `bio`: `text` (opzionale, biografia specifica per l'evento)

### C. Frontend Architecture
*   **State Management:** TanStack Query (React Query) sarà fondamentale per gestire lo stato del server. Le liste di partecipanti/relatori saranno trattate come dati remoti, con caching e invalidazione automatica (es. dopo aver aggiunto un utente, la query della lista viene invalidata per mostrare i dati aggiornati).
*   **Gestione Importazione:**
    *   Il frontend userà una libreria come `react-dropzone` per l'uploader.
    *   Dopo aver avviato il job di importazione, il client effettuerà il polling dell'endpoint `/jobs/[jobId]/status` a intervalli regolari (es. ogni 3 secondi) per aggiornare la UI sullo stato.
    *   Una volta che lo stato è `completed` o `failed`, il polling si interrompe e viene mostrato il risultato finale.
*   **Component Hierarchy:**
    *   `app/admin/events/[eventId]/participants/page.tsx`
        *   `ParticipantsTable.tsx`
        *   `ParticipantFilters.tsx`
        *   `ImportModal.tsx`
        *   `InviteForm.tsx`
    *   `app/events/[eventId]/register/page.tsx` (Portale Pubblico)
        *   `RegistrationForm.tsx`

### D. Security Considerations
*   **RBAC (Role-Based Access Control):** Ogni Server Action/API endpoint deve rigorosamente verificare che l'utente autenticato abbia il ruolo `ADMIN` e sia associato all'evento (`eventId`) che sta tentando di modificare.
*   **Sanificazione CSV:** Il backend deve trattare i file CSV come non attendibili. Deve validare l'header, ogni singola riga e ogni cella (es. validare formato email, pulire da potenziali script). Limitare la dimensione massima del file (es. 5MB) e il numero di righe (es. 5000) per prevenire attacchi DoS.
*   **Token di Invito:** I token generati per gli inviti devono essere a uso singolo e avere una scadenza breve (es. 72 ore) per ridurre la finestra di un potenziale abuso.

### E. Testing Strategy
*   **Unit Tests:**
    *   Testare la logica di parsing e validazione del CSV in una funzione isolata.
    *   Testare i componenti del form di registrazione con la loro validazione.
    *   Testare la logica dei filtri della tabella partecipanti.
*   **Integration Tests:**
    *   Testare l'intero flusso di importazione, mockando il file system e il database, per assicurarsi che il background job processi correttamente i dati e aggiorni il DB.
    *   Testare che le chiamate API per la gestione dei partecipanti rispettino le policy di autorizzazione.
*   **E2E Tests:**
    *   **Flusso Admin:** Un test simula un admin che naviga nella gestione partecipanti, aggiunge un utente manualmente, ne invita un altro via email, e infine carica un file CSV. Il test verificherà che la tabella si aggiorni correttamente dopo ogni azione.
    *   **Flusso Utente:** Un test simula un utente che si auto-registra a un evento dal portale pubblico e verifica di poter accedere alla pagina dell'evento.