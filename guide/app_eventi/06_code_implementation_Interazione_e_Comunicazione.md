# Feature Slice: Interazione e Comunicazione

## 1. High-Fidelity UI/UX Design

### Screen: Portale Pubblico (Elenco Eventi & Dettaglio)
#### **Description & UX**
*   **User Goal:** Un utente non autenticato vuole scoprire gli eventi disponibili, visualizzarne i dettagli e decidere se registrarsi.
*   **UI Details:**
    *   **Elenco Eventi**: Una pagina pulita e "ariosa" con un titolo **H1** ("Prossimi Eventi"). Gli eventi sono mostrati in una griglia di **Card Standard**. Ogni card mostra un'immagine di copertina (opzionale), il nome dell'evento (**H3**), le date e il luogo (**Small**), e un bottone **Primary** "Scopri di più".
    *   **Dettaglio Evento**: Cliccando sulla card si accede a una pagina dedicata con un'immagine "hero", il titolo dell'evento (**H1**), una descrizione dettagliata (**Body**), una sezione "Programma" con la lista delle sessioni e un'area "call-to-action" fissa o prominente con il bottone **Primary** "Registrati Ora".
*   **Animations:** Le card dell'elenco hanno una sottile animazione di sollevamento al passaggio del mouse (transizione **Standard**). Lo scrolling nella pagina di dettaglio è fluido.
*   **Color & Typography:** La pagina utilizza lo sfondo `Background (#f9fafb)` e le card `Surface (#ffffff)`. La tipografia è pulita e altamente leggibile per un pubblico vasto. I bottoni "call-to-action" usano il `Primary Blue` per risaltare.

### Screen: Bacheca Comunicazioni
#### **Description & UX**
*   **User Goal:** Un partecipante o un relatore vuole essere aggiornato con le ultime notizie e annunci relativi a un evento a cui è iscritto.
*   **UI Details:** All'interno della dashboard dell'utente (Partecipante/Relatore), questa sezione presenta un elenco cronologico inverso di annunci. Ogni annuncio è una **Card** con un titolo (**H3**), la data di pubblicazione (**Caption**) e il corpo del messaggio (**Body**). Gli annunci non letti possono avere un indicatore visivo (es. un pallino color `Primary Blue`).
*   **Animations:** L'apparizione di nuovi annunci può essere segnalata da una sottile animazione.
*   **Color & Typography:** Design pulito e focalizzato sulla leggibilità. I link all'interno degli annunci usano il colore `Primary Blue`.

### Screen: App Check-in (Vista Staff Evento)
#### **Description & UX**
*   **User Goal:** Un membro dello staff all'ingresso dell'evento vuole registrare l'entrata e l'uscita dei partecipanti in modo rapido e senza errori, usando un dispositivo mobile.
*   **UI Details:** L'interfaccia è minimalista e ottimizzata per l'uso in mobilità.
    *   La schermata principale mostra una **vista live della fotocamera** che occupa gran parte dello schermo, con una cornice o una linea di scansione animata per guidare l'utente.
    *   Un'area di feedback sotto la vista della fotocamera mostra il risultato dell'ultima scansione.
    *   Un bottone **Secondary** permette di "Cercare Manualmente" un partecipante.
    *   **Feedback di Scansione**:
        *   **Successo**: L'area di feedback diventa `Success Green`, mostra il nome del partecipante, un'icona Lucide `CheckCircle` e lo stato ("Check-in effettuato" o "Check-out effettuato").
        *   **Errore (es. QR non valido/già usato)**: L'area di feedback diventa `Error Red`, mostra un messaggio chiaro e un'icona `XCircle`.
*   **Animations:** Le transizioni di stato del feedback sono istantanee (150ms) per non rallentare l'operatore. La linea di scansione ha un'animazione continua per indicare che l'app è attiva.
*   **Color & Typography:** Uso massiccio dei colori funzionali (`Success`, `Error`) per un feedback inequivocabile. Il testo è grande e ad alto contrasto per essere leggibile anche in condizioni di luce non ottimali.

## 2. Technical Specification

### A. System & API Design
#### **Server Actions / API Endpoints**
*   `GET /events/public`
    *   **Description:** Recupera la lista di tutti gli eventi marcati come pubblici. Ottimizzato per la performance e il caching.
    *   **Success Response:** `200 OK` con un array di oggetti evento (solo dati pubblici).
*   `GET /events/public/[slug]`
    *   **Description:** Recupera i dettagli pubblici di un singolo evento, incluso il programma.
    *   **Success Response:** `200 OK` con l'oggetto evento. `404 Not Found` se l'evento non è pubblico o non esiste.
*   `GET /events/[eventId]/announcements`
    *   **Description:** Recupera la lista degli annunci per un dato evento, visibili al ruolo dell'utente autenticato.
    *   **Success Response:** `200 OK` con un array di annunci.
*   `POST /events/[eventId]/announcements`
    *   **Description:** (Admin only) Crea un nuovo annuncio e opzionalmente invia notifiche email.
    *   **Request Body:** `{"title": "...", "content": "...", "targetRoles": ["PARTICIPANT"], "sendEmail": true}`.
    *   **Success Response:** `201 Created`.
*   `POST /events/[eventId]/checkin`
    *   **Description:** (Staff/Admin only) Processa una scansione QR. La logica interna determina se si tratta di un check-in o di un check-out.
    *   **Request Body:** `{"participantToken": "..."}` (il contenuto del QR code).
    *   **Success Response:** `200 OK` con lo stato aggiornato (es. `{"status": "CHECKED_IN", "name": "Mario Rossi"}`).
    *   **Error Responses:** `404 Not Found` (token non valido), `409 Conflict` (es. check-in già effettuato).

### B. Database Schema
*   **Tabella `events`**
    *   Aggiungere un campo `isPublic`: `boolean` (default: `false`).
    *   Aggiungere un campo `slug`: `string` (unique, per URL leggibili).
*   **Tabella `announcements`**
    *   `id`: `string` (UUID, primary key)
    *   `eventId`: `string` (foreign key a `events.id`)
    *   `adminId`: `string` (foreign key a `users.id`)
    *   `title`: `string`
    *   `content`: `text`
    *   `targetRoles`: `jsonb` (array di ruoli, es. `["PARTICIPANT", "SPEAKER"]`)
    *   `createdAt`: `datetime`
*   **Tabella `event_participants`**
    *   Modificare il campo `status` in `enum` (`REGISTERED`, `WAITLISTED`, `CHECKED_IN`, `ABSENT`).
    *   Aggiungere `checkInTime`: `datetime` (nullable).
    *   Aggiungere `checkOutTime`: `datetime` (nullable).
    *   Aggiungere `qrToken`: `string` (UUID, unique, non nullo). Questo è il token che verrà inserito nel QR code.

### C. Frontend Architecture
*   **Portale Pubblico:** Saranno pagine Next.js renderizzate server-side (Server Components) per massimizzare le performance e la SEO. I dati verranno fetchati direttamente sul server.
*   **QR Code Generation:** Il QR code verrà generato client-side nel profilo del partecipante usando una libreria come `react-qr-code`. Il valore del QR code sarà il `qrToken` univoco, non dati personali.
*   **App Check-in:**
    *   Sarà una pagina protetta accessibile solo a utenti con ruolo `STAFF` o `ADMIN`.
    *   Utilizzerà una libreria come `html5-qrcode` per accedere alla fotocamera e gestire la scansione.
    *   La logica di scansione chiamerà la Server Action `checkin` e gestirà la UI di feedback in base alla risposta. Lo stato (caricamento, successo, errore) sarà gestito localmente con `useState` o `useReducer` per una reattività immediata.
    *   Sarà implementato un "debouncing" o un "cooldown" di pochi secondi dopo una scansione per prevenire invii multipli accidentali dello stesso QR code.

### D. Security Considerations
*   **Esposizione Dati Pubblici:** L'endpoint `/events/public` deve esporre solo un sottoinsieme sicuro dei campi dell'evento, escludendo qualsiasi informazione interna o finanziaria.
*   **QR Code Security:** Il `qrToken` deve essere un UUIDv4 random e non sequenziale per impedire che possa essere indovinato. Non deve contenere dati personali (PII). L'endpoint di check-in deve validare che il token appartenga a un partecipante di *quello specifico evento*.
*   **Autorizzazione Check-in:** L'endpoint di check-in deve essere protetto da un middleware che verifica il ruolo dell'utente (`STAFF` o `ADMIN`) e la sua associazione all'evento.

### E. Testing Strategy
*   **Unit Tests:**
    *   Testare la funzione di generazione del `qrToken` per garantirne l'unicità.
    *   Testare il componente React per la scansione QR in isolamento, simulando i callback di successo/errore della libreria di scansione.
*   **Integration Tests:**
    *   Testare che l'endpoint `/events/public` non esponga mai eventi non pubblici.
    *   Testare la logica dell'endpoint di check-in: un primo POST con un token valido deve risultare in `CHECKED_IN`, un secondo in `CHECKED_OUT`, un terzo di nuovo in `CHECKED_IN`, etc. (se la logica lo permette) o in un errore di conflitto.
*   **E2E Tests:**
    *   **Flusso Partecipante:** Un test simula un utente che visita il portale pubblico, trova un evento, si registra, accede alla sua dashboard e visualizza il proprio QR code.
    *   **Flusso Staff:** Un test simula un utente Staff che effettua il login, naviga alla pagina di check-in, e "scansiona" (simulando il dato in input) il QR code generato nel test precedente, verificando che la UI mostri il messaggio di successo.