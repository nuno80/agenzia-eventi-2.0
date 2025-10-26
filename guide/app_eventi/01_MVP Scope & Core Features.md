
### Versione Finale dell'MVP Scope & Core Features

Ecco l'MVP Scope aggiornato, incorporando tutte le discussioni e le tue ultime specificazioni.

---

### MVP Scope & Core Features (Versione Finale)

-   **Gestione Eventi**: Creazione e configurazione completa di eventi (congressi medici, conferenze aziendali, fiere, workshop) con definizione di data, luogo, capacità massima e programma dettagliato.
-   **Gestione Partecipanti**: Registrazione tramite invito, inserimento manuale o auto-registrazione; tracciamento degli stati (iscritto, presente, assente); gestione liste d'attesa quando la capacità è raggiunta.
-   **Gestione Relatori**: Amministrazione dei relatori con stati specifici (invitato, confermato, presente, assente) e raccolta informazioni per sessioni programmate. Possibilità per i relatori di caricare materiali e richiedere rimborsi.
-   **Gestione Sponsor**: Catalogazione degli sponsor con tracciamento del budget offerto, richieste specifiche (tavoli, vele, posizionamento in sala) e deliverables concordati.
-   **Gestione Servizi**: Coordinamento di fornitori esterni (catering, audio-video, location) con gestione di preventivi (upload PDF), contratti (upload PDF), stati di avanzamento e costi effettivi. I fornitori non accedono all'app.
-   **Gestione Viaggi e Transfer Relatori**: Memorizzazione di voli/treni prenotati (date, orari), gestione rimborsi (con workflow di richiesta/approvazione/pagamento) e coordinamento pick-up/drop-off per i relatori. I relatori possono caricare documentazione per i rimborsi.
-   **Budget e Controllo Costi**: Tracciamento del budget complessivo dell'evento con confronto real-time tra costi preventivati e costi effettivi. Generazione di report esportabili (Excel, PDF).
-   **Portale Partecipanti**: Interfaccia web responsive dove i partecipanti possono visualizzare eventi pubblici disponibili, registrarsi e consultare il programma.
-   **Questionari Post-Evento**: Sistema per somministrare questionari di feedback o valutativi basati su template fissi dopo la conclusione dell'evento, con raccolta dati tracciata per partecipante e reporting base (grafici, export) nel rispetto della privacy.
-   **Bacheca Comunicazioni**: Area dedicata per comunicazioni unidirezionali dall'organizzatore verso partecipanti e relatori in stile annunci.
-   **Sistema Multi-Ruolo**: Gestione di cinque ruoli utente (Admin, Relatore, Partecipante, Sponsor, **Staff**) con permessi e viste differenziate.
    *   **Admin**: Accesso completo a tutte le funzionalità e a tutti gli eventi.
    *   **Staff**: Accesso limitato alle funzionalità di check-in/check-out e visualizzazione lista partecipanti.
-   **Profilo Utente Base**: Sezione per la gestione dei dati personali dell'utente e visualizzazione degli eventi a cui è registrato.
-   **Check-in/Check-out con QR Code**: Generazione di QR code univoci per i partecipanti e sistema di scansione da parte di Admin/Staff per registrare presenza con timestamp (richiede connessione internet).

---

### System Diagram 

```svg
<svg viewBox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Definitions -->
  <defs>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Frontend Layer -->
  <rect x="50" y="50" width="900" height="160" rx="10" fill="#3B82F6" opacity="0.1" stroke="#3B82F6" stroke-width="2"/>
  <text x="500" y="80" text-anchor="middle" font-size="18" font-weight="bold" fill="#3B82F6">FRONTEND LAYER</text>
  
  <rect x="100" y="100" width="200" height="90" rx="8" fill="#3B82F6" filter="url(#shadow)"/>
  <text x="200" y="135" text-anchor="middle" font-size="14" font-weight="bold" fill="white">Admin Dashboard</text>
  <text x="200" y="155" text-anchor="middle" font-size="11" fill="white">Next.js 15</text>
  <text x="200" y="172" text-anchor="middle" font-size="11" fill="white">Server Components</text>
  
  <rect x="400" y="100" width="200" height="90" rx="8" fill="#3B82F6" filter="url(#shadow)"/>
  <text x="500" y="135" text-anchor="middle" font-size="14" font-weight="bold" fill="white">Public Portal</text>
  <text x="500" y="155" text-anchor="middle" font-size="11" fill="white">Responsive Web App</text>
  <text x="500" y="172" text-anchor="middle" font-size="11" fill="white">Next.js 15</text>
  
  <rect x="700" y="100" width="200" height="90" rx="8" fill="#3B82F6" filter="url(#shadow)"/>
  <text x="800" y="135" text-anchor="middle" font-size="14" font-weight="bold" fill="white">Relatori/Sponsor/Staff</text>
  <text x="800" y="155" text-anchor="middle" font-size="11" fill="white">Dashboards</text>
  <text x="800" y="172" text-anchor="middle" font-size="11" fill="white">Next.js 15</text>
  
  <!-- API Layer -->
  <rect x="50" y="250" width="900" height="120" rx="10" fill="#10B981" opacity="0.1" stroke="#10B981" stroke-width="2"/>
  <text x="500" y="280" text-anchor="middle" font-size="18" font-weight="bold" fill="#10B981">API LAYER</text>
  
  <rect x="250" y="300" width="500" height="50" rx="8" fill="#10B981" filter="url(#shadow)"/>
  <text x="500" y="330" text-anchor="middle" font-size="14" font-weight="bold" fill="white">Next.js API Routes + Server Actions</text>
  
  <!-- Business Logic Layer -->
  <rect x="50" y="410" width="900" height="140" rx="10" fill="#F59E0B" opacity="0.1" stroke="#F59E0B" stroke-width="2"/>
  <text x="500" y="440" text-anchor="middle" font-size="18" font-weight="bold" fill="#F59E0B">BUSINESS LOGIC LAYER</text>
  
  <rect x="120" y="460" width="180" height="70" rx="8" fill="#F59E0B" filter="url(#shadow)"/>
  <text x="210" y="485" text-anchor="middle" font-size="12" font-weight="bold" fill="white">Event Management</text>
  <text x="210" y="505" text-anchor="middle" font-size="10" fill="white">Service Layer</text>
  
  <rect x="320" y="460" width="180" height="70" rx="8" fill="#F59E0B" filter="url(#shadow)"/>
  <text x="410" y="485" text-anchor="middle" font-size="12" font-weight="bold" fill="white">User & Auth</text>
  <text x="410" y="505" text-anchor="middle" font-size="10" fill="white">Service Layer</text>
  
  <rect x="520" y="460" width="180" height="70" rx="8" fill="#F59E0B" filter="url(#shadow)"/>
  <text x="610" y="485" text-anchor="middle" font-size="12" font-weight="bold" fill="white">Budget & Services</text>
  <text x="610" y="505" text-anchor="middle" font-size="10" fill="white">Service Layer</text>
  
  <rect x="720" y="460" width="180" height="70" rx="8" fill="#F59E0B" filter="url(#shadow)"/>
  <text x="810" y="485" text-anchor="middle" font-size="12" font-weight="bold" fill="white">Communication</text>
  <text x="810" y="505" text-anchor="middle" font-size="10" fill="white">Service Layer</text>
  
  <!-- Data Layer -->
  <rect x="50" y="590" width="900" height="160" rx="10" fill="#8B5CF6" opacity="0.1" stroke="#8B5CF6" stroke-width="2"/>
  <text x="500" y="620" text-anchor="middle" font-size="18" font-weight="bold" fill="#8B5CF6">DATA LAYER</text>
  
  <rect x="200" y="640" width="250" height="90" rx="8" fill="#8B5CF6" filter="url(#shadow)"/>
  <text x="325" y="675" text-anchor="middle" font-size="14" font-weight="bold" fill="white">Better-SQLite3</text>
  <text x="325" y="695" text-anchor="middle" font-size="11" fill="white">Local Database</text>
  <text x="325" y="712" text-anchor="middle" font-size="10" fill="white">Drizzle ORM</text>
  
  <rect x="550" y="640" width="250" height="90" rx="8" fill="#8B5CF6" filter="url(#shadow)"/>
  <text x="675" y="675" text-anchor="middle" font-size="14" font-weight="bold" fill="white">Better Auth</text>
  <text x="675" y="695" text-anchor="middle" font-size="11" fill="white">Authentication</text>
  <text x="675" y="712" text-anchor="middle" font-size="10" fill="white">Session Management</text>
  
  <!-- Arrows -->
  <path d="M 200 190 L 200 250" stroke="#64748B" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
  <path d="M 500 190 L 500 250" stroke="#64748B" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
  <path d="M 800 190 L 800 250" stroke="#64748B" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
  
  <path d="M 500 350 L 500 410" stroke="#64748B" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
  
  <path d="M 210 530 L 325 590" stroke="#64748B" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
  <path d="M 410 530 L 410 590" stroke="#64748B" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
  <path d="M 610 530 L 500 590" stroke="#64748B" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
  <path d="M 675 530 L 675 640" stroke="#64748B" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
  
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <polygon points="0 0, 10 3, 0 6" fill="#64748B"/>
    </marker>
  </defs>
</svg>
```

---

### Technology Stack Rationale (Confermata e Aggiornata)

**Next.js 16 (Frontend + API)**
- **VALIDATO**: Scelta eccellente. Next.js 16 con App Router offre Server Components, Server Actions e API Routes integrate, ideali per un'architettura monolitica moderna. La possibilità di co-locare frontend e backend semplifica deployment su VPS e riduce la complessità operativa. Il supporto nativo per TypeScript e l'ecosistema React sono perfetti per costruire sia l'admin dashboard che il portale pubblico. Per la timeline di 2 mesi, Next.js accelera lo sviluppo grazie alle convenzioni built-in.

**torso (Database)**
- **VALIDATO**: già implementata nel mio starter-kit.

**vercel-blog (gestione file)**
- **VALIDATO**: già implementata nel mio starter-kit

**Better Auth (Autenticazione)**
- **DA APPROVARE**: Sono indeciso se usare Better Auth, Clerck o Kinde Auth: Kinde's free tier is more generous for B2B/multi-tenant applications, including features like organizations, roles, and permissions, while Clerk's free tier is focused on developer experience with pre-built components for consumer apps. For B2B applications, Kinde's free tier includes 10,500 MAU and built-in B2B management, whereas Clerk's free tier has 10,000 MAU and limits organizations to 100 and users per org to 5. Both have a free starting tier, but Kinde is often seen as a lower-cost option for startups needing more robust features, while Clerk is praised for its ease of use and strong React integration.

**Drizzle ORM (Per gestione database)**
- **VALIDATO**: Drizzle ORM è il companion ideale per Torso e Next.js. Type-safe, leggero, con migrations automatiche e ottima DX.

**VPS Hosting**
- **VALIDATO**: Per un'applicazione proprietaria con dati sensibili (GDPR) e budget controllato, un VPS è appropriato. Permette controllo completo, nessun vendor lock-in e costi prevedibili. Con Next.js standalone build, il deployment è semplice. **RACCOMANDAZIONE SPECIFICA**: VPS in EU (Hetzner, OVH, Contabo) per compliance GDPR. Minimo: 4GB RAM, 2 vCPU per gestire Next.js + SQLite + 20 eventi concorrenti.

**Resend (Email)**
- **VALIDATO**: Resend è l'opzione preferita per le notifiche email (conferma iscrizione, reminder). Offre 3000 email/mese gratuite, perfetto per MVP.

**Libreria `qrcode` (Generazione QR Code)**
- **VALIDATO**: Per check-in/check-out tramite QR code, useremo la libreria `qrcode` (Node.js) per la generazione server-side.

---

### Scalability & Hosting Recommendation (Confermata e Aggiornata)

**Raccomandazione: VPS Managed con Piano di Scalabilità Progressiva**

Dato il contesto (un team di admin, eventi fino a 300 partecipanti, timeline 2 mesi, proprietà del codice), la soluzione ottimale è un **VPS in Europa con migrazione database pianificata**.

**FASE 1 (0-6 mesi)**: VPS Hetzner CPX21 (4GB RAM, ~€9.50/mese) con Better-SQLite3. Deploy Next.js standalone, Nginx, SSL con Certbot. Backup giornalieri automatici (snapshots del VPS).
*   **PRO**: Costo iniziale basso, setup semplice e veloce, controllo completo dati, zero dipendenze esterne, performance eccellente per l'MVP.

**FASE 2 (6-12 mesi)**: Upgrade stesso VPS a CPX31 (8GB RAM, ~€18/mese), migrazione da SQLite a PostgreSQL usando Drizzle migrations. Aggiungi Redis per session caching e performance.
*   **PRO**: Scalabile fino a 100.000 utenti con ottimizzazioni, supporta connessioni concorrenti illimitate, backup granulari, full-text search.

**FASE 3 (12+ mesi, se necessario)**: Se superi 100 eventi simultanei, considera database managed separato (Supabase self-hosted, Neon, o PostgreSQL cluster) mantenendo applicazione su VPS.

---

Abbiamo concluso lo Step 1 con una visione chiara e dettagliata dell'MVP, dello stack tecnologico e della strategia di scalabilità.

Sono pronto per lo **Step 2: UX e Design System**! Aspetto i tuoi input sui flussi utente, i componenti chiave e la filosofia di design.