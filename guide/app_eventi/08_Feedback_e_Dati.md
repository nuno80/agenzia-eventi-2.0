# Feature Slice: Feedback e Dati

## 1. High-Fidelity UI/UX Design

### Screen: Form Builder (Creazione/Modifica Questionario)
#### **Description & UX**
*   **User Goal:** Creare un questionario di feedback personalizzato in modo intuitivo, quasi come comporre un documento.
*   **UI Details:** L'interfaccia si ispira a strumenti come Google Forms o Typeform.
    *   Un'area principale mostra l'anteprima del questionario. L'utente può cliccare su un campo per modificarlo direttamente ("inline editing").
    *   Un pannello laterale flottante o una barra degli strumenti contiene i tipi di domande disponibili (es. "Testo Breve", "Scelta Multipla", "Scala Lineare"), rappresentati da icone Lucide. L'utente può trascinare ("drag-and-drop") un nuovo tipo di domanda nel questionario.
    *   Ogni domanda nel builder ha controlli per renderla "Obbligatoria", duplicarla o eliminarla.
    *   La pagina ha un'intestazione con il titolo del questionario e un bottone **Primary** "Salva Questionario". Una tab "Impostazioni" permette di definire il periodo di validità del questionario (es. "disponibile per 72 ore dopo la fine dell'evento").
*   **Animations:** Il drag-and-drop è fluido, con un'anteprima visiva di dove verrà inserita la domanda. I pannelli e i controlli appaiono con transizioni morbide (**Emphasis**, 250ms).
*   **Color & Typography:** Design pulito e minimale per non distrarre dalla creazione dei contenuti. L'elemento attivo/selezionato è evidenziato con `Primary Blue`.

### Screen: Compilazione Questionario (Vista Partecipante)
#### **Description & UX**
*   **User Goal:** Un partecipante vuole fornire il suo feedback in modo rapido e piacevole, senza frizioni.
*   **UI Details:** L'interfaccia è pulita, "ariosa" e ottimizzata per mobile. Mostra una domanda alla volta o un elenco scorrevole, a seconda della complessità. I componenti del form (radio button, checkbox, scale) sono grandi e facili da usare. Una barra di progresso in alto indica a che punto della compilazione si trova l'utente. Il bottone di invio **Primary** è ben visibile alla fine.
*   **Animations:** Il passaggio tra le domande (se una alla volta) ha una transizione fluida. Il click sui radio button o checkbox ha una microinterazione immediata.
*   **Color & Typography:** La tipografia è grande e leggibile. L'uso del colore del brand (`Primary Blue`) è limitato agli elementi interattivi per guidare l'utente.

### Screen: Visualizzazione Risultati (Vista Admin)
#### **Description & UX**
*   **User Goal:** Analizzare i risultati del questionario per capire il livello di soddisfazione dei partecipanti.
*   **UI Details:** La pagina dei risultati ha due tab: "Riepilogo" e "Risposte Individuali".
    *   **Riepilogo**: Mostra i dati aggregati. Per ogni domanda, viene generato un grafico appropriato: un grafico a torta o a barre per le domande a scelta multipla, e una distribuzione per le scale di valutazione. Le risposte a testo libero sono mostrate come una lista scorrevole.
    *   **Risposte Individuali**: Permette di sfogliare le risposte complete di ogni singolo partecipante.
    *   Un bottone **Secondary** "Esporta Risultati (CSV)" è sempre visibile.
*   **Animations:** I grafici si animano al caricamento per presentare i dati in modo dinamico.
*   **Color & Typography:** I grafici usano la palette di colori definita per essere chiari e coerenti con il brand.

## 2. Technical Specification

### A. System & API Design
#### **Server Actions / API Endpoints**
*   `POST /events/[eventId]/surveys`
    *   **Description:** (Admin only) Crea o aggiorna un questionario.
    *   **Request Body:** Un oggetto JSON che rappresenta la struttura del form. Esempio: `{"title": "...", "questions": [{"type": "MULTIPLE_CHOICE", "label": "...", "options": ["..."]}]}`.
    *   **Success Response:** `201 Created` o `200 OK`.
*   `GET /events/[eventId]/surveys`
    *   **Description:** (Partecipante) Recupera la struttura del questionario da compilare.
    *   **Success Response:** `200 OK` con la struttura JSON del form.
*   `POST /events/[eventId]/surveys/responses`
    *   **Description:** (Partecipante) Invia le risposte a un questionario.
    *   **Request Body:** Un oggetto JSON con le risposte. Esempio: `{"answers": [{"questionId": "...", "value": "..."}]}`.
    *   **Success Response:** `201 Created`.
*   `GET /events/[eventId]/surveys/results`
    *   **Description:** (Admin only) Recupera i dati aggregati e individuali delle risposte.
    *   **Success Response:** `200 OK` con un oggetto JSON contenente i dati per i grafici e la lista delle risposte individuali.
*   `GET /events/[eventId]/reports/budget`
    *   **Description:** (Admin only) Genera e restituisce un report del budget in formato Excel o PDF.
    *   **Query Params:** `format=xlsx` o `format=pdf`.
    *   **Success Response:** `200 OK` con il file.

### B. Database Schema
*   **Tabella `surveys`**
    *   `id`: `string` (UUID, primary key)
    *   `eventId`: `string` (foreign key a `events.id`, unique, un solo questionario per evento nell'MVP)
    *   `title`: `string`
    *   `structure`: `jsonb` (memorizza l'intera struttura del form, incluse domande, tipi e opzioni)
    *   `settings`: `jsonb` (memorizza impostazioni come il periodo di validità)
*   **Tabella `survey_responses`**
    *   `id`: `string` (UUID, primary key)
    *   `surveyId`: `string` (foreign key a `surveys.id`)
    *   `participantId`: `string` (foreign key a `event_participants.id`)
    *   `answers`: `jsonb` (memorizza le risposte dell'utente)
    *   `submittedAt`: `datetime`

### C. Frontend Architecture
*   **Form Builder:** Questa è la parte più complessa.
    *   Si utilizzerà una libreria per il drag-and-drop come `dnd-kit` o `react-beautiful-dnd`.
    *   Lo stato della struttura del form sarà gestito in un `useState` o `useReducer`. Ogni modifica (aggiunta domanda, cambio testo, etc.) aggiornerà questo stato.
    *   Al salvataggio, l'oggetto di stato verrà serializzato in JSON e inviato al backend.
*   **Form Rendering (Partecipante):**
    *   Il frontend riceverà la struttura JSON del form dal backend.
    *   Un componente "renderer" mapperà la struttura JSON ai componenti React corrispondenti (es. se `type` è `MULTIPLE_CHOICE`, renderizza una serie di radio button).
    *   Si userà `react-hook-form` per gestire lo stato e la validazione del form generato dinamicamente.
*   **Grafici e Reporting:**
    *   Per la visualizzazione dei risultati, si userà una libreria di grafici come `Recharts` o `Chart.js`.
    *   Per la generazione dei report lato server, si useranno librerie Node.js come `exceljs` per Excel e `pdfkit` o una soluzione headless browser come `Puppeteer` per i PDF.

### D. Security Considerations
*   **Autorizzazione:**
    *   La creazione/modifica dei questionari e la visualizzazione dei risultati sono strettamente limitate agli `ADMIN`.
    *   La compilazione di un questionario è limitata ai `PARTICIPANT` registrati a quell'evento. Il backend deve verificare che un utente non possa inviare risposte per un evento a cui non è iscritto.
    *   Un partecipante può inviare le risposte una sola volta.
*   **Sanificazione Dati:**
    *   Sia la struttura del form creata dall'admin, sia le risposte inviate dai partecipanti devono essere sanificate sul backend per prevenire attacchi XSS, specialmente per i campi a testo libero.
*   **Privacy (GDPR):** Sarà chiaramente specificato nell'informativa che le risposte ai questionari non sono anonime ma associate al profilo del partecipante.

### E. Testing Strategy
*   **Unit Tests:**
    *   Testare la logica del "reducer" che gestisce lo stato del Form Builder (aggiungere, rimuovere, riordinare domande).
    *   Testare il componente "renderer" per assicurarsi che renderizzi correttamente i componenti UI a partire da una struttura JSON di esempio.
    *   Testare le funzioni server-side per l'aggregazione dei dati delle risposte.
*   **Integration Tests:**
    *   Testare che la struttura JSON di un form salvata nel database venga recuperata e renderizzata correttamente sul client del partecipante.
    *   Testare che l'endpoint di generazione report produca file validi e formattati correttamente.
*   **E2E Tests:**
    *   **Flusso Completo:**
        1.  Un `Admin` effettua il login, crea un questionario con almeno 3 tipi di domande diversi e lo salva.
        2.  Un `Partecipante` effettua il login, naviga al questionario, lo compila e lo invia.
        3.  L'`Admin` torna alla pagina dei risultati e verifica che i dati aggregati (grafici) e la risposta individuale del partecipante siano visibili correttamente.
        4.  L'`Admin` clicca su "Esporta" e verifica che il download del file CSV/Excel parta correttamente.