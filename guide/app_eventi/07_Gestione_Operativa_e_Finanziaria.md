# Feature Slice: Gestione Operativa e Finanziaria

## 1. High-Fidelity UI/UX Design

### Screen: Gestione Budget (Vista Admin)
#### **Description & UX**
*   **User Goal:** Avere una visione chiara e in tempo reale dello stato finanziario dell'evento, confrontando costi preventivati, costi effettivi e entrate.
*   **UI Details:** La pagina è una dashboard finanziaria. In alto, delle **Statistiche Chiave** (es. "Budget Totale", "Costi Effettivi", "Entrate Sponsor", "Saldo Corrente") in stile **H2**. Sotto, una visualizzazione grafica, come una barra di progresso, che mostra la percentuale del budget consumato. La parte principale è una **Tabella** dettagliata con le voci di costo/ricavo. Ogni riga rappresenta una transazione (es. "Catering - Preventivo", "Sponsor A - Contributo") e ha colonne per Descrizione, Categoria, Importo Preventivato, Importo Effettivo, Stato (es. "Da Pagare", "Pagato") e file allegato (es. icona PDF). Un bottone **Primary** "+ Aggiungi Voce" apre un modale per inserire un nuovo costo o ricavo.
*   **Animations:** La barra di progresso del budget si anima al caricamento della pagina. I numeri nelle statistiche chiave hanno una sottile animazione di conteggio.
*   **Color & Typography:** La barra di progresso usa i colori funzionali: `Success Green` se sotto una certa soglia (es. 70%), `Warning Orange` se si avvicina al limite (es. 70-95%), e `Error Red` se il budget è superato.

### Screen: Gestione Sponsor e Fornitori (Vista Admin)
#### **Description & UX**
*   **User Goal:** Centralizzare tutte le informazioni relative a sponsor e fornitori, tracciando contratti, pagamenti e richieste logistiche.
*   **UI Details:** La schermata è divisa in due tab: "Sponsor" e "Fornitori". Ogni tab contiene una lista di **Card** o una **Tabella**.
    *   Una **Card Sponsor** mostra il logo, il nome, il livello di sponsorizzazione (es. "Gold"), l'importo del contributo e lo stato del pagamento.
    *   Una **Card Fornitore** mostra il nome, il tipo di servizio (es. "Catering"), l'importo del contratto e lo stato.
    *   Cliccando su una card si accede a una pagina di dettaglio con tutte le informazioni, i contatti, una sezione per l'upload di file (contratti, preventivi) e una checklist per le richieste logistiche (es. "Tavolo espositivo", "Logo su brochure").
*   **Animations:** Microinterazioni standard su bottoni e hover.
*   **Color & Typography:** Design pulito e funzionale, coerente con il resto dell'area admin.

### Screen: Gestione Rimborsi (Vista Admin & Relatore)
#### **Description & UX**
*   **User Goal (Admin):** Visualizzare e approvare/rifiutare le richieste di rimborso inviate dai relatori in modo efficiente.
*   **User Goal (Relatore):** Inviare una richiesta di rimborso allegando la documentazione necessaria e tracciarne lo stato.
*   **UI Details (Admin):** Una **Tabella** con le richieste in attesa. Colonne: Nome Relatore, Data Richiesta, Importo, Documento Allegato (link per il download), Stato e Azioni (bottoni "Approva", "Rifiuta").
*   **UI Details (Relatore):** All'interno della sua dashboard, una sezione "I Miei Rimborsi" mostra una lista delle sue richieste con lo stato (`In Attesa`, `Approvato`, `Rifiutato`). Un bottone **Primary** "+ Richiedi Rimborso" apre un modale con un form semplice: campo per l'importo, descrizione, e un uploader per il file della ricevuta.
*   **Error States:** Se un relatore prova a inviare un form senza allegato o importo, appaiono errori di validazione inline.

## 2. Technical Specification

### A. System & API Design
#### **Server Actions / API Endpoints**
*   `GET /events/[eventId]/budget`
    *   **Description:** Recupera tutte le voci di costo/ricavo e i dati aggregati per la dashboard del budget.
    *   **Success Response:** `200 OK` con un oggetto contenente `summary` (dati aggregati) e `lineItems` (array di voci).
*   `POST /events/[eventId]/budget/items`
    *   **Description:** Aggiunge una nuova voce di costo o ricavo.
    *   **Request Body:** `{"description": "...", "type": "COST" | "REVENUE", "estimatedAmount": 1000, "actualAmount": null, "status": "PENDING"}`.
    *   **Success Response:** `201 Created`.
*   `GET /events/[eventId]/sponsors`
    *   **Description:** Recupera la lista degli sponsor per un evento.
    *   **Success Response:** `200 OK` con un array di oggetti sponsor.
*   `POST /events/[eventId]/sponsors`
    *   **Description:** Aggiunge un nuovo sponsor.
    *   **Request Body:** Dati dello sponsor, incluso l'importo del contributo.
    *   **Success Response:** `201 Created`.
*   `POST /upload/contract`
    *   **Description:** Endpoint generico per l'upload di file (contratti, preventivi, ricevute). Gestirà il salvataggio su uno storage (es. S3, o file system del VPS).
    *   **Request Body:** `FormData` con il file.
    *   **Success Response:** `200 OK` con l'URL del file salvato.
*   `GET /events/[eventId]/reimbursements`
    *   **Description:** (Admin) Recupera tutte le richieste di rimborso. (Relatore) Recupera solo le proprie richieste.
    *   **Success Response:** `200 OK` con un array di richieste.
*   `POST /events/[eventId]/reimbursements`
    *   **Description:** (Relatore only) Crea una nuova richiesta di rimborso.
    *   **Request Body:** `{"amount": 150.50, "description": "Treno A/R", "receiptUrl": "..."}`.
    *   **Success Response:** `201 Created`.
*   `PATCH /reimbursements/[reimbursementId]`
    *   **Description:** (Admin only) Aggiorna lo stato di una richiesta (approva/rifiuta).
    *   **Request Body:** `{"status": "APPROVED" | "DECLINED"}`.
    *   **Success Response:** `200 OK`.

### B. Database Schema
*   **Tabella `budget_items`**
    *   `id`: `string` (UUID, primary key)
    *   `eventId`: `string` (foreign key a `events.id`)
    *   `description`: `string`
    *   `type`: `enum` (`COST`, `REVENUE`)
    *   `category`: `string` (es. "Catering", "Marketing", "Sponsorship")
    *   `estimatedAmount`: `decimal`
    *   `actualAmount`: `decimal` (nullable)
    *   `status`: `enum` (`PENDING`, `PAID`, `RECEIVED`)
    *   `fileUrl`: `string` (nullable, link al contratto/fattura)
*   **Tabella `sponsors`**
    *   `id`: `string` (UUID, primary key)
    *   `eventId`: `string` (foreign key a `events.id`)
    *   `name`: `string`
    *   `logoUrl`: `string` (nullable)
    *   `sponsorshipLevel`: `string` (es. "Gold", "Silver")
    *   `contributionAmount`: `decimal`
    *   `status`: `enum` (`PENDING`, `RECEIVED`)
*   **Tabella `vendors` (Fornitori)**
    *   Simile a `sponsors`, ma con campi come `serviceType` (es. "Catering", "AV").
*   **Tabella `reimbursements`**
    *   `id`: `string` (UUID, primary key)
    *   `eventId`: `string` (foreign key a `events.id`)
    *   `speakerId`: `string` (foreign key a `event_speakers.id`)
    *   `amount`: `decimal`
    *   `description`: `string`
    *   `receiptUrl`: `string`
    *   `status`: `enum` (`PENDING`, `APPROVED`, `DECLINED`, `PAID`)
    *   `requestedAt`: `datetime`

### C. Frontend Architecture
*   **State Management:** TanStack Query (React Query) è ideale per questo modulo. Invaliderà automaticamente la cache dei dati del budget (`/budget`) ogni volta che una nuova voce di costo/ricavo viene aggiunta, garantendo che la UI sia sempre sincronizzata.
*   **Gestione Upload:** Si utilizzerà un componente di upload che comunicherà con l'endpoint `/upload/contract`. Al successo dell'upload, l'URL restituito verrà usato per popolare il campo `fileUrl` nel form principale prima di inviare i dati (es. prima di creare una nuova voce di budget).
*   **Viste Condizionali:** La pagina dei rimborsi userà la stessa logica di base ma renderizzerà componenti diversi (la tabella Admin o la lista Relatore) in base al ruolo dell'utente recuperato dal contesto di autenticazione.

### D. Security Considerations
*   **Controllo Accesso Finanziario:** L'accesso a qualsiasi endpoint relativo a budget, sponsor e fornitori deve essere strettamente limitato agli utenti con ruolo `ADMIN` associati a quell'evento. Questo è il modulo più sensibile.
*   **Accesso ai File:** L'accesso ai file caricati (contratti, ricevute) deve essere protetto. L'URL dovrebbe essere un URL "presigned" con una breve scadenza o servito tramite un endpoint che prima verifica i permessi dell'utente, per evitare che un utente non autorizzato possa accedere a documenti sensibili se scopre il link diretto.
*   **Autorizzazione Rimborsi:** L'endpoint per creare un rimborso deve verificare che l'utente autenticato sia un `SPEAKER` di quell'evento. L'endpoint per approvare deve verificare che l'utente sia un `ADMIN`.

### E. Testing Strategy
*   **Unit Tests:**
    *   Testare le funzioni di calcolo per i dati aggregati del budget (es. totale costi effettivi, saldo).
    *   Testare la logica del form di richiesta rimborso, inclusa la validazione del campo importo e la richiesta di un file allegato.
*   **Integration Tests:**
    *   Testare l'intero flusso di upload di un file: il frontend invia il file, il backend lo salva e restituisce un URL, il frontend usa l'URL per creare una nuova entità nel database (es. `budget_items`).
    *   Testare le policy di autorizzazione: un tentativo da parte di un utente "Relatore" di accedere all'endpoint `/budget` deve fallire con un errore `403 Forbidden`.
*   **E2E Tests:**
    *   **Flusso Admin:** Un test simula un admin che naviga nella sezione budget, aggiunge una nuova voce di costo, carica un PDF come contratto, poi naviga nella sezione sponsor e aggiunge un nuovo sponsor. Il test verifica che i totali del budget si aggiornino correttamente.
    *   **Flusso Rimborso:** Un test end-to-end che coinvolge due attori. 1) Un utente "Relatore" effettua il login, invia una richiesta di rimborso con un allegato. 2) Un utente "Admin" effettua il login, vede la richiesta in attesa e la approva. Il test verifica che il relatore veda lo stato aggiornato a "Approvato".