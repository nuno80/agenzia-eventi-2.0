### Primary User Flows

Ecco i flussi utente primari, ora completi con i dettagli sulle notifiche, la gestione degli eventi a pagamento (anche se free nell'MVP) e gli stati di check-in/check-out.

1.  **Nuova Registrazione Utente (Partecipante / Relatore / Sponsor)**:
    *   **Scenario A: Auto-registrazione (Partecipante)**:
        `Portale Pubblico (Elenco Eventi)` -> `[Seleziona Evento]` -> `Dettaglio Evento Pubblico` -> `[Clicca "Registrati Ora"]` -> `Form di Registrazione (con consenso Privacy/Termini)` -> `[Completa Form]` -> `Conferma Registrazione` -> `[Sistema Invia Email di Benvenuto/Conferma con link a Main Page Evento]` -> `Main Page Evento (Partecipante)`
    *   **Scenario B: Registrazione tramite Invito (Relatore / Sponsor)**:
        `Email di Invito` -> `[Clicca Link di Registrazione]` -> `Form di Registrazione (pre-compilato o con token, con consenso Privacy/Termini)` -> `[Completa Form / Imposta Password]` -> `Conferma Registrazione` -> `[Sistema Invia Email di Benvenuto/Conferma]` -> `Dashboard Relatore / Sponsor` (a seconda del ruolo)
    *   **Scenario C: Registrazione Manuale Admin (per eccezioni)**:
        `Admin Dashboard (Dettaglio Evento)` -> `[Gestisci Partecipanti]` -> `Lista Partecipanti` -> `[Aggiungi Partecipante Manualmente]` -> `Form Aggiunta Partecipante` -> `[Completa Form]` -> `Conferma Aggiunta` -> `[Sistema Invia Email con credenziali/link a Partecipante]` -> `Main Page Evento (Partecipante)`

2.  **Login Utente Esistente**:
    `Login / Registrazione Screen` -> `[Inserisci Credenziali]` -> `[Clicca "Accedi"]` -> `Main Page Evento (Partecipante)` / `Admin Dashboard (Riepilogo Tutti gli Eventi)` / `Dashboard Relatore` / `Dashboard Sponsor` (a seconda del ruolo e degli eventi attivi)

3.  **Creazione e Gestione Evento (Admin)**:
    `Admin Dashboard (Riepilogo Tutti gli Eventi)` -> `[Clicca "Crea Nuovo Evento"]` -> `Wizard Creazione Evento (Step 1: Info Base)` -> `[Completa Step 1]` -> `[Clicca "Continua"]` -> `Wizard Creazione Evento (Step 2: Date/Luogo)` -> `[Completa Step 2]` -> `[Clicca "Continua"]` -> `Wizard Creazione Evento (Step 3: Programma Iniziale)` -> `[Completa Step 3 / Clicca "Salva e Vai a Dashboard Evento"]` -> `Admin Dashboard (Dettaglio Evento - con card modulari)` -> `[Interagisci con Card (es. "Gestisci Relatori")]` -> `Sezione Dettaglio Relatori` -> `[Torna a Dashboard Evento]`

4.  **Check-in/Check-out Partecipante (Staff Evento)**:
    `Login / Registrazione Screen (Staff)` -> `[Accedi]` -> `Screen Check-in/Check-out` -> `[Seleziona Evento (se più di uno)]` -> `[Inquadra QR Code Partecipante]` -> `Risultato Scansione (Nome Partecipante, Stato, Ora Ingresso/Uscita, Percentuale Presenza)` -> `[Sistema Aggiorna Stato Partecipante (Presente/Uscito)]` -> `[Continua a Scansionare]` / `[Cerca Partecipante Manualmente]` -> `Lista Partecipanti (per ricerca manuale)`

5.  **Consultazione Evento e Interazione (Partecipante)**:
    `Main Page Evento (Partecipante)` -> `[Consulta Programma]` -> `Dettaglio Sessione` -> `[Torna]` -> `[Consulta Bacheca Comunicazioni]` -> `Dettaglio Comunicazione` -> `[Torna]` -> `[Compila Questionario (dopo fine evento e entro X ore/giorni)]` -> `Form Questionario` -> `[Invia Questionario]` -> `Conferma Invio`

6.  **Gestione Viaggi e Rimborsi (Relatore)**:
    `Dashboard Relatore` -> `[Clicca "I Miei Viaggi & Rimborsi"]` -> `Lista Viaggi/Rimborsi` -> `[Richiedi Rimborso]` -> `Form Richiesta Rimborso (con allegato, importo)` -> `[Invia Richiesta]` -> `Lista Viaggi/Rimborsi (stato: In Attesa)` -> `[Admin Approva/Rifiuta]` -> `Lista Viaggi/Rimborsi (stato: Approvato/Rifiutato/Emesso)`

7.  **Invio Comunicazione (Admin)**:
    `Admin Dashboard (Dettaglio Evento)` -> `[Gestisci Comunicazioni]` -> `Lista Comunicazioni` -> `[Crea Nuovo Annuncio]` -> `Form Creazione Annuncio (con selezione destinatari: Tutti / Ruoli Specifici / Singoli Nominativi)` -> `[Scrivi Messaggio]` -> `[Flag: Invia anche via Email]` -> `[Invia Annuncio]` -> `Conferma Invio` -> `Lista Comunicazioni`

### Low-Fidelity Wireframes

*Ho integrato gli stati vuoti e gli errori secondo le tue indicazioni, e affinato alcuni dettagli.*

#### Screen: Login / Registrazione

```
[----------------------------------]
| [Header: Logo App]               |
|----------------------------------|
|                                  |
| [Titolo: Accedi o Registrati]    |
|                                  |
| [Input: Email]                   |
| [Input: Password]                |
|                                  |
| [Pulsante: Accedi]               |
| [Link: Hai dimenticato la password?]|
|                                  |
| [Pulsante: Registrati]           |
|                                  |
| [Checkbox: Accetto Termini e Condizioni] |
| [Checkbox: Acconsento Informativa Privacy] |
|                                  |
|----------------------------------|
| [Footer: Link a Privacy Policy, Termini di Servizio] |
[----------------------------------]
```

#### Screen: Admin Dashboard (Riepilogo Tutti gli Eventi - Empty State)

```
[----------------------------------]
| [Header: Logo, Nome App, [Icona Profilo Admin]] |
|----------------------------------|
| [Navigazione Laterale]           | [Area Contenuto Principale]
| - Dashboard (Riepilogo Tutti Eventi) |
| - [Icona Logout]                 | [Titolo: I Tuoi Eventi]
|                                  |
|                                  | [Icona: Calendario]
|                                  | [Titolo: Nessun evento creato]
|                                  | [Descrizione: Crea il tuo primo evento per iniziare a gestire congressi, conferenze e workshop.]
|                                  |
|                                  | [Pulsante Primario Grande: + Crea il primo evento]
|                                  |
[----------------------------------]
```

#### Screen: Wizard Creazione Evento (Step 2 di 3 - Date e Luogo)

```
[----------------------------------]
| [Header: Logo, Nome App]         |
|----------------------------------|
|                                  |
| [Indicatore Step: ●──●──○  Step 2 di 3] |
|                                  |
| [Titolo: Quando e Dove si svolgerà l'evento?] |
|                                  |
| [Label: Data Inizio]             |
| [Input: Data Picker]             |
|                                  |
| [Label: Data Fine]               |
| [Input: Data Picker]             |
|                                  |
| [Label: Città]                   |
| [Input: Testo]                   |
|                                  |
| [Label: Location Specifica]      |
| [Input: Testo (es. Nome Sala, Indirizzo)] |
|                                  |
| [Area Messaggio di Aiuto/Suggerimento] |
|                                  |
| [Pulsante: ← Indietro] [Pulsante: Continua →] |
[----------------------------------]
```

#### Screen: Admin Dashboard (Dettaglio Evento Specifico)

```
[-----------------------------------------------------------------]
| [Header: Logo, Nome App, [Icona Profilo Admin]]                 |
|-----------------------------------------------------------------|
| [Navigazione Laterale]                                          | [Area Contenuto Principale]
| - ← Tutti gli eventi                                            |
| - Dashboard Evento (Riepilogo)                                  | [Breadcrumb: Tutti gli eventi > [Nome Evento]]
| - Programma                                                     |
| - Partecipanti                                                  | [Titolo: [Nome Evento]]
| - Relatori                                                      | [Dettagli Evento: 15-17 Marzo 2025 • Roma]
| - Sponsor                                                       | [Azioni Veloci: [Icona Modifica] [Icona Duplica] [Icona Anteprima Pubblica]]
| - Servizi                                                       |
| - Budget                                                        | [Card: 📋 PROGRAMMA              🔄 In corso]
| - Comunicazioni                                                 | [Testo: 12 sessioni su 20 definite]
| - Questionari                                                   | [Azioni: [+ Aggiungi sessione]  [→ Gestisci Programma]]
| - [Icona Logout]                                                |
|                                                                 | [Card: 👤 RELATORI               ⚠️ Attenzione]
|                                                                 | [Testo: 28 confermati, 2 in attesa risposta]
|                                                                 | [Azioni: [+ Invita relatore]    [→ Gestisci Relatori]]
|                                                                 |
|                                                                 | [Card: 🎫 PARTECIPANTI          🔄 In corso]
|                                                                 | [Testo: 245/300 iscritti (18 in lista attesa)]
|                                                                 | [Azioni: [→ Gestisci Iscrizioni] [📊 Esporta Lista]]
|                                                                 |
|                                                                 | [Card: 💰 BUDGET & SERVIZI      🔄 In corso]
|                                                                 | [Testo: €78.000 spesi su €120.000 previsti]
|                                                                 | [Testo: 3/8 contratti fornitori firmati]
|                                                                 | [Azioni: [→ Gestisci Budget]    [→ Gestisci Servizi]]
|                                                                 |
|                                                                 | [Card: 📢 COMUNICAZIONI         ✅ Completato]
|                                                                 | [Testo: 5 annunci pubblicati]
|                                                                 | [Azioni: [+ Nuovo Annuncio]     [→ Gestisci Annunci]]
|                                                                 |
|                                                                 | [Card: ❓ QUESTIONARI           ⭕ Non iniziato]
|                                                                 | [Testo: Nessun questionario configurato]
|                                                                 | [Azioni: [→ Configura Questionario]]
[-----------------------------------------------------------------]
```

#### Screen: Sezione Dettaglio Relatori (Admin - Empty State)

```
[----------------------------------]
| [Header: Logo, Nome App, [Icona Profilo Admin]] |
|----------------------------------|
| [Navigazione Laterale]           | [Area Contenuto Principale]
| - ← Tutti gli eventi             |
| - Dashboard Evento               | [Breadcrumb: [Nome Evento] > Relatori]
| - Programma                      |
| - Partecipanti                   | [Titolo: Relatori dell'Evento [Nome Evento]]
| - Relatori (attivo)              |
| - Sponsor                        | [Pulsante Primario: + Invita Nuovo Relatore]
| - Servizi                        |
| - Budget                         |
| - Comunicazioni                  | [Icona: Microfono]
| - Questionari                    | [Titolo: Nessun relatore invitato]
| - [Icona Logout]                 | [Descrizione: Invia inviti ai relatori per le sessioni del tuo evento.]
|                                  |
|                                  | [Pulsante Secondario: Importa da CSV (futura feature)]
[----------------------------------]
```

#### Screen: Portale Pubblico (Elenco Eventi)

```
[----------------------------------]
| [Header: Logo, Nome App, [Icona Profilo Utente / Login]] |
|----------------------------------|
|                                  |
| [Titolo: Scopri i Nostri Eventi] |
|                                  |
| [Filtri / Ricerca Eventi]        |
|                                  |
| [Card Evento Pubblico 1: Immagine, Titolo, Data, Luogo, Breve Descrizione, [Pulsante Dettagli / Registrati]] |
| [Card Evento Pubblico 2: ...]    |
| [Card Evento Pubblico N...]      |
|                                  |
|----------------------------------|
| [Footer: Contatti, Privacy, Termini] |
[----------------------------------]
```

#### Screen: Main Page Evento (Partecipante)

```
[----------------------------------]
| [Header: Logo, Nome App, [Icona Profilo Utente]] |
|----------------------------------|
| [Navigazione Principale]         | [Area Contenuto Principale]
| - Il Mio Evento (Riepilogo)      |
| - Programma                      | [Titolo: Benvenuto a [Nome Evento]!]
| - Bacheca Comunicazioni          |
| - Questionario (se attivo)       | [Card: Il Tuo QR Code per il Check-in]
| - Profilo                        | [Immagine QR Code]
| - [Icona Logout]                 | [Testo: Mostra questo codice all'ingresso e all'uscita]
|                                  |
|                                  | [Card: Prossime Sessioni per Te]
|                                  | [Sessione 1: Titolo, Ora, Sala]
|                                  | [Sessione 2: Titolo, Ora, Sala]
|                                  | [Pulsante: Visualizza Programma Completo]
|                                  |
|                                  | [Card: Ultimi Annunci]
|                                  | [Annuncio 1: Titolo, Data]
|                                  | [Annuncio 2: Titolo, Data]
|                                  | [Pulsante: Vai alla Bacheca]
[----------------------------------]
```

#### Screen: Dashboard Relatore

```
[----------------------------------]
| [Header: Logo, Nome App, [Icona Profilo Relatore]] |
|----------------------------------|
| [Navigazione Laterale]           | [Area Contenuto Principale]
| - Le Mie Sessioni                |
| - I Miei Viaggi & Rimborsi       | [Titolo: Benvenuto, [Nome Relatore]!]
| - Bacheca Comunicazioni          |
| - Profilo                        | [Card: Le Tue Prossime Sessioni]
| - [Icona Logout]                 | [Sessione 1: Titolo, Data, Ora, Sala, [Pulsante Dettagli]]
|                                  | [Sessione 2: ...]
|                                  | [Pulsante: Visualizza Tutte le Sessioni]
|                                  |
|                                  | [Card: Stato Rimborsi]
|                                  | [Testo: 2 richieste in attesa, 1 approvata]
|                                  | [Pulsante: Richiedi Rimborso] [Pulsante: Gestisci Rimborsi]
|                                  |
|                                  | [Card: Ultime Comunicazioni]
|                                  | [Annuncio 1: Titolo, Data]
|                                  | [Pulsante: Vai alla Bacheca]
[----------------------------------]
```

#### Screen: Check-in/Check-out (Staff Evento)

```
[----------------------------------]
| [Header: Logo, Nome App, [Icona Profilo Staff]] |
|----------------------------------|
| [Navigazione Laterale (minimal)] | [Area Contenuto Principale]
| - [Nome Evento Selezionato]      |
| - [Icona Logout]                 | [Titolo: Check-in/Check-out Evento: [Nome Evento]]
|                                  |
|                                  | [Sezione: Scanner QR Code]
|                                  | [Testo: Inquadra il QR Code del partecipante]
|                                  | [Area Visiva Scanner (es. riquadro con linea animata)]
|                                  |
|                                  | [Sezione: Risultato Scansione]
|                                  | [Nome: Mario Rossi]
|                                  | [Stato: Presente (verde) / Uscito (arancione) / Non Registrato (rosso)]
|                                  | [Ora Ingresso: 10:32] [Ora Uscita: 15:45 (se presente)]
|                                  | [Info: Percentuale Presenza Evento: 75% (se rilevante)]
|                                  |
|                                  | [Pulsante: Cerca Partecipante Manualmente]
|                                  |
|                                  | [Link: Visualizza Lista Partecipanti Completa]
[----------------------------------]
```

#### Screen: Esempio di Toast Notification (Errore di Rete)

```
┌────────────────────────────────┐
│ ⚠️ Impossibile salvare         │
│                                 │
│ Verifica la connessione e      │
│ riprova.                        │
│                                 │
│ [Riprova]  [✕]                 │
└────────────────────────────────┘
```

#### Screen: Esempio di Inline Error (Validazione Form)

```
[----------------------------------]
| [Header...]                      |
|----------------------------------|
|                                  |
| [Label: Email]                   |
| [Input: mario.rossi@example.com____] (bordo rosso) |
| ⚠️ Questo indirizzo email è già registrato |
|                                  |
| [Label: Password]                |
| [Input: **********]              |
|                                  |
| [Pulsante: Registrati]           |
|----------------------------------|
```

#### Screen: Esempio di Modal (Errore Business Logic)

```
┌─────────────────────────────────────┐
│  ⚠️ Evento al completo              │
│                                      │
│  Non è possibile iscrivere altri    │
│  partecipanti. La capacità massima  │
│  di 300 posti è stata raggiunta.    │
│                                      │
│  Vuoi aggiungere questo partecipante│
│  alla lista d'attesa?               │
│                                      │
│  [Aggiungi a lista]  [Annulla]      │
└─────────────────────────────────────┘
```