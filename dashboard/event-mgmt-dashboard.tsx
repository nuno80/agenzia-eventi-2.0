/**
 * TabComunicazioni - components/dashboard/events/tabs/CommunicationsTab.tsx
 * TYPE: Server Component (async)
 * NOTE: "Nuova Comunicazione" button opens Client Component modal/form
 */
const TabComunicazioni = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Bacheca Comunicazioni</h3>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Nuova Comunicazione
      </Button>
    </div>
    <div className="space-y-4">
      {[
        { title: 'Promemoria Evento', date: '2025-10-20', recipients: 'Tutti i partecipanti' },
        { title: 'Aggiornamento Programma', date: '2025-10-18', recipients: 'Relatori' }
      ].map((comm, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{comm.title}</h4>
              <p className="text-sm text-gray-600 mt-1">Destinatari: {comm.recipients}</p>
              <p className="text-xs text-gray-500 mt-2">Inviata il {new Date(comm.date).toLocaleDateString('it-IT')}</p>
            </div>
            <Button variant="ghost" size="sm">Visualizza</Button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/**
 * TabQuestionari - components/dashboard/events/tabs/SurveysTab.tsx
 * TYPE: Server Component (async)
 * REASON: Displays survey results, create form is Client Component
 */
const TabQuestionari = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Questionari Post-Evento</h3>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Crea Questionario
      </Button>
    </div>
    <Card className="p-6">
      <p className="text-gray-600 text-center py-8">
        I questionari saranno disponibili dopo la conclusione dell'evento
      </p>
    </Card>
  </div>
);

/**
 * TabCheckin - components/dashboard/events/tabs/CheckinTab.tsx
 * TYPE: Hybrid Component
 * - Stats cards: Server Component
 * - QR Scanner: Client Component (needs camera access)
 * 
 * RECOMMENDED STRUCTURE:
 * // CheckinTab.tsx (Server Component wrapper)
 * async function CheckinTab({ eventId }) {
 *   const stats = await getCheckinStats(eventId);
 *   return (
 *     <>
 *       <CheckinStats stats={stats} />
 *       <QRScanner eventId={eventId} />
 *     </>
 *   );
 * }
 * 
 * // QRScanner.tsx (Client Component)
 * "use client";
 * function QRScanner({ eventId }) {
 *   const [scanning, setScanning] = useState(false);
 *   // Camera and QR logic
 * }
 */
const TabCheckin = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Check-in Partecipanti</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Totale Iscritti</p>
        <p className="text-3xl font-bold text-gray-900">120</p>
      </Card>
      <Card className="p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Presenti</p>
        <p className="text-3xl font-bold text-green-600">85</p>
      </Card>
      <Card className="p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Assenti</p>
        <p className="text-3xl font-bold text-red-600">35</p>
      </Card>
    </div>
    <Card className="p-6">
      <div className="text-center py-8">
        <div className="h-32 w-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <UserCheck className="h-16 w-16 text-gray-400" />
        </div>
        <h4 className="font-semibold text-gray-900 mb-2">Scanner QR Code</h4>
        <p className="text-sm text-gray-600 mb-4">Funzionalità disponibile prossimamente</p>
        <Button variant="outline" disabled>Avvia Scanner</Button>
      </div>
    </Card>
  </div>
);

// ============================================================================
// EVENT FORM COMPONENT - MOVE TO: components/dashboard/events/EventForm.tsx
// ============================================================================

/**
 * CreaEvento Component - app/(dashboard)/eventi/nuovo/page.tsx
 * TYPE: CLIENT COMPONENT ("use client")
 * REASON: Form with state management and validation
 * 
 * NEXT.JS 16 PATTERN WITH SERVER ACTIONS:
 * "use client";
 * import { createEvent } from '@/app/actions/events';
 * 
 * function EventForm() {
 *   async function handleSubmit(formData: FormData) {
 *     const result = await createEvent(formData);
 *     if (result.success) {
 *       router.push(`/eventi/${result.eventId}`);
 *     }
 *   }
 * 
 *   return (
 *     <form action={handleSubmit}>
 *       // Form fields
 *     </form>
 *   );
 * }
 * 
 * // app/actions/events.ts
 * "use server";
 * export async function createEvent(formData: FormData) {
 *   // Validate with Zod
 *   // Insert into database
 *   // Revalidate cache
 *   return { success: true, eventId: '...' };
 * }
 */
const CreaEvento = () => (
  <div className="space-y-6 max-w-3xl">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Crea Nuovo Evento</h1>
      <p className="text-gray-600 mt-1">Compila le informazioni base per creare un nuovo evento</p>
    </div>

    <Card className="p-6">
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Evento *</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Es. Congresso Nazionale Cardiologia 2025"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Evento *</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Seleziona...</option>
              <option>Congresso Medico</option>
              <option>Conferenza Aziendale</option>
              <option>Workshop</option>
              <option>Fiera</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacità Massima *</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="150"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Es. Milano, Palazzo Congressi"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Inizio *</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Fine *</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget Totale (€) *</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione</label>
          <textarea 
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descrizione dettagliata dell'evento..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit">Crea Evento</Button>
          <Button variant="outline" type="button">Annulla</Button>
        </div>
      </form>
    </Card>
  </div>
);

// ============================================================================
// PEOPLE PAGE COMPONENT - MOVE TO: components/dashboard/people/PeopleList.tsx
// ============================================================================

/**
 * PersonePage Component - app/(dashboard)/persone/[tipo]/page.tsx
 * TYPE: Server Component (async) wrapper + Client Component for table
 * 
 * RECOMMENDED STRUCTURE:
 * // app/(dashboard)/persone/[tipo]/page.tsx
 * async function PersonePage({ params }) {
 *   const { tipo } = await params;
 *   const people = await getPeopleByType(tipo);
 *   return <PeopleTable tipo={tipo} people={people} />
 * }
 * 
 * // components/dashboard/people/PeopleTable.tsx
 * "use client";
 * function PeopleTable({ tipo, people }) {
 *   const [searchQuery, setSearchQuery] = useState('');
 *   const [sortBy, setSortBy] = useState('name');
 *   // Filter and sort logic
 * }
 */
const PersonePage = ({ tipo }) => {
  const titles = {
    partecipanti: 'Tutti i Partecipanti',
    relatori: 'Tutti i Relatori',
    sponsor: 'Tutti gli Sponsor',
    staff: 'Staff Team'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{titles[tipo]}</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi {tipo === 'partecipanti' ? 'Partecipante' : tipo === 'relatori' ? 'Relatore' : tipo === 'sponsor' ? 'Sponsor' : 'Staff'}
        </Button>
      </div>

      <Card>
        {/* NOTE: Search input should be in Client Component for real-time filtering */}
        <div className="p-4 border-b border-gray-200">
          <input 
            type="text" 
            placeholder="Cerca..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eventi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tipo === 'relatori' ? `Dr. ${i % 2 === 0 ? 'Giuseppe' : 'Maria'} ${i % 2 === 0 ? 'Verdi' : 'Bianchi'}` : 
                     tipo === 'sponsor' ? `${i % 2 === 0 ? 'PharmaCorp' : 'MedTech'} ${i}` :
                     `${i % 2 === 0 ? 'Mario' : 'Laura'} ${i % 2 === 0 ? 'Rossi' : 'Neri'}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tipo === 'sponsor' ? 'info@company.com' : `persona${i}@email.com`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{Math.floor(Math.random() * 3) + 1} eventi</td>
                  <td className="px-6 py-4">
                    <Badge variant={i % 3 === 0 ? 'success' : i % 3 === 1 ? 'warning' : 'default'}>
                      {i % 3 === 0 ? 'Confermato' : i % 3 === 1 ? 'In attesa' : 'Invitato'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">Dettagli</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// FINANCE PAGE COMPONENT - MOVE TO: components/dashboard/finance/
// ============================================================================

/**
 * FinancePage Component - app/(dashboard)/finance/page.tsx
 * TYPE: Server Component (async)
 * 
 * DATA FETCHING:
 * async function FinancePage() {
 *   const budgetOverview = await getBudgetOverview();
 *   return <FinanceOverview data={budgetOverview} />
 * }
 * 
 * SPLIT INTO:
 * - BudgetStats.tsx (Server Component - summary cards)
 * - BudgetTable.tsx (Server Component - table display)
 * - BudgetChart.tsx (Client Component - interactive chart with Chart.js or Recharts)
 */
const FinancePage = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Budget Overview - Multi-Evento</h1>

    {/* SPLIT: BudgetStats Component */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Budget Totale</p>
        <p className="text-3xl font-bold text-gray-900">€300.000</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Speso</p>
        <p className="text-3xl font-bold text-blue-600">€234.700</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-2">Rimanente</p>
        <p className="text-3xl font-bold text-green-600">€65.300</p>
      </Card>
    </div>

    {/* SPLIT: BudgetTable Component */}
    <Card>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Budget per Evento</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Speso</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockEvents.map((event) => {
              const percentage = (event.spent / event.budget) * 100;
              return (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">€{event.budget.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">€{event.spent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{percentage.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${percentage > 90 ? 'bg-red-600' : percentage > 75 ? 'bg-amber-600' : 'bg-green-600'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>

    {/* NOTE: Export buttons trigger Server Actions */}
    <div className="flex gap-4">
      <Button>
        <FileText className="h-4 w-4 mr-2" />
        Esporta Report Completo
      </Button>
      <Button variant="outline">
        <FileText className="h-4 w-4 mr-2" />
        Esporta Excel
      </Button>
    </div>
  </div>
);

// ============================================================================
// SETTINGS PAGE COMPONENT - MOVE TO: components/dashboard/settings/
// ============================================================================

/**
 * ImpostazioniPage Component - app/(dashboard)/impostazioni/page.tsx
 * TYPE: CLIENT COMPONENT ("use client")
 * REASON: Forms with state and checkboxes with onChange handlers
 * 
 * SPLIT INTO:
 * - ProfileForm.tsx (Client Component - form state)
 * - GlobalSettings.tsx (Client Component - toggle switches)
 */
const ImpostazioniPage = () => (
  <div className="space-y-6 max-w-3xl">
    <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>

    {/* SPLIT: ProfileForm Component */}
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profilo Admin</h3>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input 
              type="text" 
              defaultValue="Admin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
            <input 
              type="text" 
              defaultValue="User"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            defaultValue="admin@eventmgr.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button>Salva Modifiche</Button>
      </form>
    </Card>

    {/* SPLIT: GlobalSettings Component - requires "use client" for checkbox onChange */}
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurazioni Globali</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Notifiche Email</p>
            <p className="text-sm text-gray-600">Ricevi notifiche per nuove iscrizioni</p>
          </div>
          <input type="checkbox" defaultChecked className="h-5 w-5" />
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Auto-conferma Iscrizioni</p>
            <p className="text-sm text-gray-600">Conferma automatica senza approvazione</p>
          </div>
          <input type="checkbox" className="h-5 w-5" />
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900">Tema Scuro</p>
            <p className="text-sm text-gray-600">Modalità dark mode</p>
          </div>
          <input type="checkbox" className="h-5 w-5" />
        </div>
      </div>
    </Card>
  </div>
);

// ============================================================================
// MAIN APP COMPONENT - This stays as the demo wrapper
// In production, layout logic goes to app/(dashboard)/layout.tsx
// ============================================================================

/**
 * EventManagementDashboard Component - DEMO WRAPPER ONLY
 * 
 * IN PRODUCTION:
 * This component is NOT needed. Instead, use Next.js App Router:
 * 
 * app/(dashboard)/layout.tsx:
 * "use client";
 * export default function DashboardLayout({ children }) {
 *   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 *   return (
 *     <>
 *       <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
 *       <div className="lg:pl-64">
 *         <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
 *         <main className="p-6">{children}</main>
 *       </div>
 *     </>
 *   );
 * }
 * 
 * Each page (page.tsx) becomes a Server Component by default.
 */
export default function EventManagementDashboard() {
  const [currentPage, setCurrentPage] = useState('/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (path) => {
    setCurrentPage(path);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderPage = () => {
    // Home
    if (currentPage === '/') return <DashboardHome />;

    // Eventi
    if (currentPage === '/eventi') return <EventiLista onNavigate={navigate} />;
    if (currentPage === '/eventi/nuovo') return <CreaEvento />;
    if (currentPage.startsWith('/eventi/') && !currentPage.includes('/eventi/nuovo')) {
      const parts = currentPage.split('/');
      const eventId = parts[2];
      const tab = parts[3] || 'overview';
      return <EventoDettaglio eventId={eventId} currentTab={tab} onNavigate={navigate} />;
    }

    // Persone
    if (currentPage === '/persone/partecipanti') return <PersonePage tipo="partecipanti" />;
    if (currentPage === '/persone/relatori') return <PersonePage tipo="relatori" />;
    if (currentPage === '/persone/sponsor') return <PersonePage tipo="sponsor" />;
    if (currentPage === '/persone/staff') return <PersonePage tipo="staff" />;

    // Finance
    if (currentPage === '/finance' || currentPage === '/finance/report') return <FinancePage />;

    // Impostazioni
    if (currentPage === '/impostazioni') return <ImpostazioniPage />;

    return <DashboardHome />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={navigate}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />
      
      <div className="lg:pl-64">
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
        
        <main className="p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

/*
 * ============================================================================
 * IMPLEMENTATION CHECKLIST
 * ============================================================================
 * 
 * 1. CREATE DIRECTORY STRUCTURE
 *    □ src/components/dashboard/ui/
 *    □ src/components/dashboard/layout/
 *    □ src/components/dashboard/home/
 *    □ src/components/dashboard/events/ (+ tabs subdirectory)
 *    □ src/components/dashboard/people/
 *    □ src/components/dashboard/finance/
 *    □ src/components/dashboard/settings/
 *    □ src/lib/data/
 *    □ src/lib/dal/
 *    □ src/lib/utils.ts
 * 
 * 2. MOVE MOCK DATA
 *    □ mockEvents → lib/data/mock-data.ts
 *    □ mockDeadlines → lib/data/mock-data.ts
 *    □ mockStats → lib/data/mock-data.ts
 * 
 * 3. CREATE UI COMPONENTS (Server Components)
 *    □ Button.tsx
 *    □ Card.tsx
 *    □ Badge.tsx
 *    NOTE: In production, install and use shadcn/ui instead
 * 
 * 4. CREATE LAYOUT COMPONENTS (Client Components)
 *    □ Sidebar.tsx - Add "use client"
 *    □ Header.tsx - Add "use client"
 *    □ Convert onClick to Link components
 * 
 * 5. CREATE PAGE COMPONENTS (Server Components by default)
 *    □ app/(dashboard)/page.tsx → DashboardHome
 *    □ app/(dashboard)/eventi/page.tsx → EventiLista
 *    □ app/(dashboard)/eventi/nuovo/page.tsx → CreaEvento (Client)
 *    □ app/(dashboard)/eventi/[id]/[tab]/page.tsx → EventoDettaglio
 *    □ app/(dashboard)/persone/[tipo]/page.tsx → PersonePage
 *    □ app/(dashboard)/finance/page.tsx → FinancePage
 *    □ app/(dashboard)/impostazioni/page.tsx → ImpostazioniPage (Client)
 * 
 * 6. CREATE TAB COMPONENTS (Server Components)
 *    □ tabs/OverviewTab.tsx
 *    □ tabs/ParticipantsTab.tsx (hybrid - Server wrapper + Client table)
 *    □ tabs/SpeakersTab.tsx
 *    □ tabs/SponsorsTab.tsx
 *    □ tabs/AgendaTab.tsx
 *    □ tabs/ServicesTab.tsx
 *    □ tabs/BudgetTab.tsx
 *    □ tabs/CommunicationsTab.tsx
 *    □ tabs/SurveysTab.tsx
 *    □ tabs/CheckinTab.tsx (hybrid - Server stats + Client scanner)
 * 
 * 7. CREATE UTILITY FUNCTIONS
 *    □ getPriorityColor() → lib/utils.ts
 *    □ getDaysUntil() → lib/utils.ts
 *    □ formatCurrency() → lib/utils.ts
 *    □ formatDate() → lib/utils.ts
 * 
 * 8. SETUP DATA ACCESS LAYER (DAL)
 *    □ lib/dal/events.ts
 *      - getUpcomingEvents()
 *      - getAllEvents()
 *      - getEventById(id)
 *      - createEvent(data)
 *    □ lib/dal/participants.ts
 *      - getEventParticipants(eventId)
 *      - getParticipantById(id)
 *      - createParticipant(data)
 *    □ lib/dal/speakers.ts
 *      - getEventSpeakers(eventId)
 *      - getSpeakerById(id)
 *      - createSpeaker(data)
 *    □ lib/dal/deadlines.ts
 *      - getUrgentDeadlines()
 *      - getEventDeadlines(eventId)
 *    □ lib/dal/budget.ts
 *      - getBudgetOverview()
 *      - getEventBudget(eventId)
 *    
 *    PATTERN FOR EACH DAL FUNCTION:
 *    ```ts
 *    import { cache } from 'react';
 *    import { db } from '@/lib/db';
 *    
 *    export const getEventById = cache(async (id: string) => {
 *      const event = await db.query.events.findFirst({
 *        where: (events, { eq }) => eq(events.id, id)
 *      });
 *      return event;
 *    });
 *    ```
 * 
 * 9. CREATE SERVER ACTIONS (for mutations)
 *    □ app/actions/events.ts
 *      "use server";
 *      - createEvent(formData)
 *      - updateEvent(id, formData)
 *      - deleteEvent(id)
 *    □ app/actions/participants.ts
 *      - createParticipant(formData)
 *      - updateParticipantStatus(id, status)
 *    □ app/actions/budget.ts
 *      - updateBudgetCategory(eventId, category, amount)
 *      - exportBudgetReport(eventId, format)
 *    
 *    PATTERN FOR SERVER ACTIONS:
 *    ```ts
 *    "use server";
 *    import { revalidatePath } from 'next/cache';
 *    import { db } from '@/lib/db';
 *    import { z } from 'zod';
 *    
 *    const eventSchema = z.object({
 *      name: z.string().min(3),
 *      type: z.string(),
 *      // ... other fields
 *    });
 *    
 *    export async function createEvent(formData: FormData) {
 *      // 1. Extract and validate data
 *      const data = {
 *        name: formData.get('name') as string,
 *        type: formData.get('type') as string,
 *        // ...
 *      };
 *      const validated = eventSchema.parse(data);
 *      
 *      // 2. Insert into database
 *      const [event] = await db.insert(events).values(validated).returning();
 *      
 *      // 3. Revalidate cache
 *      revalidatePath('/eventi');
 *      
 *      return { success: true, eventId: event.id };
 *    }
 *    ```
 * 
 * 10. REPLACE MOCK DATA WITH REAL DATA FETCHING
 *     In each page.tsx:
 *     ```ts
 *     // Before (mock):
 *     const events = mockEvents;
 *     
 *     // After (real):
 *     import { getAllEvents } from '@/lib/dal/events';
 *     const events = await getAllEvents();
 *     ```
 * 
 * 11. IMPLEMENT FORM VALIDATIONS
 *     □ Install Zod: npm install zod
 *     □ Create schemas in lib/validations/
 *     □ Use in Server Actions for validation
 *     □ Use react-hook-form in Client Components
 * 
 * 12. ADD SUSPENSE BOUNDARIES
 *     For slow data fetching:
 *     ```tsx
 *     import { Suspense } from 'react';
 *     
 *     <Suspense fallback={<LoadingSkeleton />}>
 *       <SlowComponent />
 *     </Suspense>
 *     ```
 * 
 * 13. ADD ERROR BOUNDARIES
 *     Create error.tsx in route segments:
 *     ```tsx
 *     'use client';
 *     export default function Error({ error, reset }) {
 *       return (
 *         <div>
 *           <h2>Qualcosa è andato storto</h2>
 *           <button onClick={reset}>Riprova</button>
 *         </div>
 *       );
 *     }
 *     ```
 * 
 * 14. OPTIMIZE IMAGES
 *     Replace any <img> with next/image <Image>:
 *     ```tsx
 *     import Image from 'next/image';
 *     <Image src="/logo.png" alt="Logo" width={200} height={50} priority />
 *     ```
 * 
 * 15. ADD METADATA
 *     In each page.tsx:
 *     ```tsx
 *     import type { Metadata } from 'next';
 *     
 *     export const metadata: Metadata = {
 *       title: 'Eventi - Event Manager',
 *       description: 'Gestisci tutti i tuoi eventi'
 *     };
 *     ```
 * 
 * 16. IMPLEMENT FILE UPLOADS (for PDF contracts/quotes)
 *     □ Use vercel-blob for file storage (already in your stack)
 *     □ Create upload Server Action:
 *     ```ts
 *     "use server";
 *     import { put } from '@vercel/blob';
 *     
 *     export async function uploadContract(formData: FormData) {
 *       const file = formData.get('file') as File;
 *       const blob = await put(file.name, file, { access: 'public' });
 *       return { url: blob.url };
 *     }
 *     ```
 * 
 * 17. ADD EMAIL NOTIFICATIONS (with Resend)
 *     □ Setup Resend: npm install resend
 *     □ Create email templates in lib/emails/
 *     □ Send from Server Actions:
 *     ```ts
 *     import { Resend } from 'resend';
 *     const resend = new Resend(process.env.RESEND_API_KEY);
 *     
 *     await resend.emails.send({
 *       from: 'noreply@eventmanager.com',
 *       to: participant.email,
 *       subject: 'Conferma iscrizione',
 *       html: '<p>Sei registrato!</p>'
 *     });
 *     ```
 * 
 * 18. IMPLEMENT QR CODE GENERATION
 *     □ Install qrcode: npm install qrcode @types/qrcode
 *     □ Generate in Server Component:
 *     ```ts
 *     import QRCode from 'qrcode';
 *     
 *     const qrCodeUrl = await QRCode.toDataURL(participant.id);
 *     ```
 * 
 * 19. ADD LOADING STATES
 *     Create loading.tsx in route segments:
 *     ```tsx
 *     export default function Loading() {
 *       return <div>Caricamento...</div>;
 *     }
 *     ```
 * 
 * 20. TESTING CHECKLIST
 *     □ Test all forms (create/edit)
 *     □ Test navigation between pages
 *     □ Test mobile responsiveness
 *     □ Test data fetching and caching
 *     □ Test Server Actions (mutations)
 *     □ Test error scenarios
 *     □ Test file uploads
 *     □ Test email sending
 *     □ Test export functionality
 * 
 * ============================================================================
 * COMPONENT TYPE QUICK REFERENCE
 * ============================================================================
 * 
 * SERVER COMPONENTS (async, no "use client"):
 * - All page.tsx files (unless they need form state)
 * - UI components (Button, Card, Badge)
 * - List/Table display components (EventList, BudgetTable)
 * - Stats/Overview components
 * - All tab content components (unless interactive)
 * 
 * CLIENT COMPONENTS ("use client" required):
 * - Layout components with state (Sidebar, Header)
 * - Forms with useState/validation
 * - Interactive tables with filters/sorting
 * - Components with onClick/onChange handlers
 * - Components using browser APIs (camera, localStorage)
 * - Components with useEffect/useRef
 * - Modal/Dialog components with open/close state
 * 
 * HYBRID APPROACH:
 * - Server Component fetches data
 * - Passes data to Client Component as props
 * - Client Component handles interactions
 * 
 * Example:
 * ```tsx
 * // ParticipantsTab.tsx (Server Component)
 * async function ParticipantsTab({ eventId }) {
 *   const participants = await getEventParticipants(eventId);
 *   return <ParticipantsTable data={participants} />;
 * }
 * 
 * // ParticipantsTable.tsx (Client Component)
 * "use client";
 * function ParticipantsTable({ data }) {
 *   const [filter, setFilter] = useState('');
 *   const filtered = data.filter(p => p.name.includes(filter));
 *   return <table>...</table>;
 * }
 * ```
 * 
 * ============================================================================
 * NEXT.JS 16 SPECIFIC NOTES
 * ============================================================================
 * 
 * 1. ASYNC PARAMS:
 *    All params and searchParams are now async and must be awaited:
 *    ```tsx
 *    async function Page({ params }: { params: Promise<{ id: string }> }) {
 *      const { id } = await params;
 *    }
 *    ```
 * 
 * 2. USE CACHE DIRECTIVE:
 *    Cache entire page/component output:
 *    ```tsx
 *    "use cache";
 *    async function ExpensiveComponent() {
 *      const data = await slowQuery();
 *      return <div>{data}</div>;
 *    }
 *    ```
 * 
 * 3. DYNAMIC RENDERING:
 *    Force dynamic rendering (no caching):
 *    ```tsx
 *    export const dynamic = 'force-dynamic';
 *    ```
 * 
 * 4. REVALIDATION:
 *    Two methods:
 *    - Time-based: `export const revalidate = 3600;` (1 hour)
 *    - On-demand: `revalidatePath('/eventi')` in Server Actions
 * 
 * 5. STREAMING:
 *    Use Suspense for progressive rendering:
 *    ```tsx
 *    <Suspense fallback={<Loading />}>
 *      <SlowComponent />
 *    </Suspense>
 *    ```
 * 
 * ============================================================================
 * DATABASE SCHEMA REFERENCE (for Drizzle ORM)
 * ============================================================================
 * 
 * Suggested tables to create in lib/db/schema.ts:
 * 
 * 1. events
 *    - id, name, type, location, startDate, endDate, capacity, budget, status
 * 
 * 2. participants
 *    - id, eventId, userId, name, email, status, registrationDate, qrCode
 * 
 * 3. speakers
 *    - id, userId, name, email, bio, status
 * 
 * 4. event_speakers
 *    - id, eventId, speakerId, sessionTitle, materials, status
 * 
 * 5. sponsors
 *    - id, name, contactEmail, tier, budget
 * 
 * 6. event_sponsors
 *    - id, eventId, sponsorId, packageType, deliverables
 * 
 * 7. services
 *    - id, eventId, providerName, type, quotePdf, contractPdf, estimated, actual, status
 * 
 * 8. budget_categories
 *    - id, eventId, category, estimated, actual
 * 
 * 9. communications
 *    - id, eventId, title, content, recipients, sentAt
 * 
 * 10. surveys
 *     - id, eventId, title, questions (JSON), responses (relation)
 * 
 * 11. deadlines
 *     - id, eventId, title, description, dueDate, type, priority, completed
 * 
 * 12. checkins
 *     - id, participantId, eventId, checkedInAt
 * 
 * ============================================================================
 * ENVIRONMENT VARIABLES NEEDED
 * ============================================================================
 * 
 * Create .env.local:
 * ```
 * # Database
 * DATABASE_URL="file:./event-manager.db"
 * 
 * # Authentication (Better Auth / Clerk / Kinde)
 * BETTER_AUTH_SECRET="your-secret-key"
 * BETTER_AUTH_URL="http://localhost:3000"
 * 
 * # Email (Resend)
 * RESEND_API_KEY="re_..."
 * 
 * # File Storage (Vercel Blob)
 * BLOB_READ_WRITE_TOKEN="vercel_blob_..."
 * 
 * # Optional: Analytics, Error Tracking, etc.
 * ```
 * 
 * ============================================================================
 * PERFORMANCE OPTIMIZATION TIPS
 * ============================================================================
 * 
 * 1. Use React.cache() for expensive computations in Server Components
 * 2. Implement proper Suspense boundaries for slow queries
 * 3. Use loading.tsx for instant navigation feedback
 * 4. Optimize images with next/image (always use priority for hero images)
 * 5. Lazy load heavy Client Components with next/dynamic
 * 6. Use Server Actions instead of API routes when possible
 * 7. Implement pagination for large lists (participants, events)
 * 8. Cache frequently accessed data with proper revalidation
 * 9. Use database indexes on frequently queried fields
 * 10. Minimize Client Component bundle size (keep interactivity minimal)
 * 
 * ============================================================================
 * SECURITY BEST PRACTICES
 * ============================================================================
 * 
 * 1. NEVER expose database queries directly in Client Components
 * 2. Always validate input in Server Actions with Zod
 * 3. Use Better Auth session checks before data mutations
 * 4. Sanitize user input before database insertion
 * 5. Use parameterized queries (Drizzle handles this)
 * 6. Implement CSRF protection (Better Auth handles this)
 * 7. Rate limit Server Actions (use middleware)
 * 8. Validate file uploads (type, size)
 * 9. Use environment variables for secrets (never commit .env)
 * 10. Implement proper error handling (don't leak sensitive info)
 * 
 * ============================================================================
 * DEPLOYMENT CHECKLIST
 * ============================================================================
 * 
 * 1. Run database migrations
 * 2. Test all Server Actions
 * 3. Verify environment variables are set
 * 4. Test email sending (Resend production key)
 * 5. Test file uploads (Vercel Blob production token)
 * 6. Set up SSL certificates (Certbot on VPS)
 * 7. Configure Nginx reverse proxy
 * 8. Set up automated backups (database snapshots)
 * 9. Configure monitoring/logging
 * 10. Test on production domain
 * 
 * ============================================================================
 * END OF STRUCTURE GUIDE
 * ============================================================================
 *//*
 * ============================================================================
 * EVENT MANAGEMENT DASHBOARD - STRUCTURE GUIDE
 * ============================================================================
 * 
 * Questo file contiene il codice completo della dashboard con commenti dettagliati
 * per facilitare la suddivisione in componenti separati seguendo le best practices
 * di Next.js 16.
 * 
 * STRUTTURA DIRECTORY SUGGERITA:
 * 
 * src/
 * ├── app/
 * │   ├── (dashboard)/
 * │   │   ├── layout.tsx              # Root layout con Sidebar + Header
 * │   │   ├── page.tsx                # Dashboard Home
 * │   │   ├── eventi/
 * │   │   │   ├── page.tsx            # Lista eventi (Server Component)
 * │   │   │   ├── nuovo/page.tsx      # Form creazione evento
 * │   │   │   └── [id]/
 * │   │   │       ├── page.tsx        # Redirect a overview
 * │   │   │       └── [tab]/page.tsx  # Tabs dinamici
 * │   │   ├── persone/
 * │   │   │   ├── partecipanti/page.tsx
 * │   │   │   ├── relatori/page.tsx
 * │   │   │   ├── sponsor/page.tsx
 * │   │   │   └── staff/page.tsx
 * │   │   ├── finance/
 * │   │   │   ├── page.tsx
 * │   │   │   └── report/page.tsx
 * │   │   └── impostazioni/page.tsx
 * │   └── ...
 * ├── components/
 * │   ├── dashboard/
 * │   │   ├── layout/
 * │   │   │   ├── Sidebar.tsx         # CLIENT (useState per mobile)
 * │   │   │   ├── Header.tsx          # CLIENT (mobile menu toggle)
 * │   │   │   └── index.ts
 * │   │   ├── ui/
 * │   │   │   ├── Button.tsx          # SERVER (presentational)
 * │   │   │   ├── Card.tsx            # SERVER
 * │   │   │   ├── Badge.tsx           # SERVER
 * │   │   │   └── index.ts
 * │   │   ├── home/
 * │   │   │   ├── UrgentDeadlines.tsx # SERVER (async data fetch)
 * │   │   │   ├── StatsOverview.tsx   # SERVER
 * │   │   │   ├── UpcomingEvents.tsx  # SERVER
 * │   │   │   └── index.ts
 * │   │   ├── events/
 * │   │   │   ├── EventList.tsx       # SERVER (async fetch)
 * │   │   │   ├── EventCard.tsx       # SERVER (presentational)
 * │   │   │   ├── EventForm.tsx       # CLIENT (form state)
 * │   │   │   ├── EventTabs.tsx       # CLIENT (tab state)
 * │   │   │   ├── tabs/
 * │   │   │   │   ├── OverviewTab.tsx # SERVER
 * │   │   │   │   ├── ParticipantsTab.tsx # SERVER + CLIENT sections
 * │   │   │   │   ├── SpeakersTab.tsx
 * │   │   │   │   ├── SponsorsTab.tsx
 * │   │   │   │   ├── AgendaTab.tsx
 * │   │   │   │   ├── ServicesTab.tsx
 * │   │   │   │   ├── BudgetTab.tsx
 * │   │   │   │   ├── CommunicationsTab.tsx
 * │   │   │   │   ├── SurveysTab.tsx
 * │   │   │   │   └── CheckinTab.tsx
 * │   │   │   └── index.ts
 * │   │   ├── people/
 * │   │   │   ├── PeopleTable.tsx     # CLIENT (filters, sorting)
 * │   │   │   └── index.ts
 * │   │   ├── finance/
 * │   │   │   ├── BudgetChart.tsx     # CLIENT (interactive chart)
 * │   │   │   ├── BudgetTable.tsx     # SERVER
 * │   │   │   └── index.ts
 * │   │   └── settings/
 * │   │       ├── ProfileForm.tsx     # CLIENT (form state)
 * │   │       └── index.ts
 * │   └── ...
 * ├── lib/
 * │   ├── data/
 * │   │   ├── mock-data.ts            # Mock data per sviluppo
 * │   │   └── index.ts
 * │   ├── dal/
 * │   │   ├── events.ts               # Data Access Layer (cache wrapper)
 * │   │   ├── participants.ts
 * │   │   ├── speakers.ts
 * │   │   └── index.ts
 * │   └── utils.ts
 * └── ...
 * 
 * ============================================================================
 */

import React, { useState } from 'react';
import { Calendar, Users, DollarSign, AlertCircle, Plus, Settings, FileText, UserCheck, Building2, Briefcase, Menu, ChevronRight, X } from 'lucide-react';

// ============================================================================
// MOCK DATA - MOVE TO: lib/data/mock-data.ts
// ============================================================================
// TYPE: Pure Data - No React components
// USAGE: Import in Server Components for data fetching simulation

const mockEvents = [
  {
    id: '1',
    name: 'Congresso Nazionale Cardiologia 2025',
    type: 'Congresso Medico',
    location: 'Milano, Palazzo Congressi',
    startDate: '2025-11-15',
    endDate: '2025-11-17',
    capacity: 150,
    registered: 120,
    budget: 50000,
    spent: 45000,
    status: 'upcoming'
  },
  {
    id: '2',
    name: 'Workshop Innovazione Digitale',
    type: 'Workshop',
    location: 'Roma, Centro Congressi Frentani',
    startDate: '2025-11-05',
    endDate: '2025-11-05',
    capacity: 80,
    registered: 65,
    budget: 15000,
    spent: 14200,
    status: 'upcoming'
  },
  {
    id: '3',
    name: 'Conferenza Annuale Enterprise',
    type: 'Conferenza Aziendale',
    location: 'Firenze, Grand Hotel',
    startDate: '2025-10-28',
    endDate: '2025-10-29',
    capacity: 200,
    registered: 200,
    budget: 75000,
    spent: 72000,
    status: 'active'
  },
  {
    id: '4',
    name: 'Simposio Neurologia Pediatrica',
    type: 'Congresso Medico',
    location: 'Bologna, Centro Convegni',
    startDate: '2025-09-20',
    endDate: '2025-09-22',
    capacity: 100,
    registered: 95,
    budget: 40000,
    spent: 39500,
    status: 'completed'
  },
  {
    id: '5',
    name: 'Fiera Tecnologie Sanitarie',
    type: 'Fiera',
    location: 'Torino, Lingotto Fiere',
    startDate: '2025-08-10',
    endDate: '2025-08-12',
    capacity: 300,
    registered: 287,
    budget: 120000,
    spent: 118000,
    status: 'completed'
  }
];

const mockDeadlines = [
  {
    id: '1',
    title: 'Conferma menu catering',
    eventName: 'Congresso Nazionale Cardiologia',
    dueDate: '2025-10-29',
    priority: 'high',
    type: 'servizi',
    description: 'Confermare scelta menu con fornitore catering'
  },
  {
    id: '2',
    title: 'Invio materiali relatori',
    eventName: 'Congresso Nazionale Cardiologia',
    dueDate: '2025-11-01',
    priority: 'high',
    type: 'relatori',
    description: 'Sollecito invio slides presentazioni'
  },
  {
    id: '3',
    title: 'Pagamento acconto location',
    eventName: 'Workshop Innovazione Digitale',
    dueDate: '2025-10-30',
    priority: 'medium',
    type: 'budget',
    description: 'Versare 50% anticipo location'
  },
  {
    id: '4',
    title: 'Chiusura iscrizioni',
    eventName: 'Workshop Innovazione Digitale',
    dueDate: '2025-11-02',
    priority: 'medium',
    type: 'evento',
    description: 'Bloccare nuove registrazioni'
  },
  {
    id: '5',
    title: 'Conferma presenza relatore Dr. Rossi',
    eventName: 'Congresso Nazionale Cardiologia',
    dueDate: '2025-11-08',
    priority: 'low',
    type: 'relatori',
    description: 'Ottenere conferma finale presenza'
  }
];

const mockStats = {
  activeEvents: 3,
  totalParticipants: 767,
  budgetUsed: 78,
  confirmedSpeakers: 24
};

// ============================================================================
// UI COMPONENTS - MOVE TO: components/dashboard/ui/
// ============================================================================
// TYPE: Server Components (presentational, no state, no interactivity)
// FILES: Button.tsx, Card.tsx, Badge.tsx
// NOTE: These are pure presentational components inspired by shadcn/ui
//       In production, replace with actual shadcn/ui components

/**
 * Button Component - components/dashboard/ui/Button.tsx
 * TYPE: Server Component (default)
 * PROPS: variant, size, className, children, ...props
 * USAGE: Can be used in both Server and Client Components
 */
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10'
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Card Component - components/dashboard/ui/Card.tsx
 * TYPE: Server Component
 * PROPS: children, className
 */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Badge Component - components/dashboard/ui/Badge.tsx
 * TYPE: Server Component
 * PROPS: children, variant
 * USAGE: Display status indicators
 */
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// ============================================================================
// LAYOUT COMPONENTS - MOVE TO: components/dashboard/layout/
// ============================================================================

/**
 * Sidebar Component - components/dashboard/layout/Sidebar.tsx
 * TYPE: CLIENT COMPONENT ("use client")
 * REASON: Requires useState for mobile menu toggle and section expansion
 * PROPS: currentPage (string), onNavigate (function), isMobileOpen (boolean), onMobileClose (function)
 * 
 * IMPLEMENTATION NOTES:
 * - In Next.js 16, use Link from 'next/link' instead of onClick navigation
 * - Remove onNavigate prop and use <Link href="..."> for proper routing
 * - Keep mobile menu state management (useState)
 * - Keep section expansion state (useState for accordion)
 * 
 * EXAMPLE CONVERSION:
 * <button onClick={() => onNavigate('/eventi')}>Eventi</button>
 * TO:
 * <Link href="/eventi" className="...">Eventi</Link>
 */
const Sidebar = ({ currentPage, onNavigate, isMobileOpen, onMobileClose }) => {
  const navigation = [
    { id: 'home', label: 'Dashboard', icon: Calendar, href: '/' },
    { 
      id: 'eventi', 
      label: 'Eventi', 
      icon: Calendar,
      children: [
        { id: 'eventi-lista', label: 'Tutti gli Eventi', href: '/eventi' },
        { id: 'eventi-nuovo', label: 'Crea Evento', href: '/eventi/nuovo' }
      ]
    },
    {
      id: 'persone',
      label: 'Persone',
      icon: Users,
      children: [
        { id: 'partecipanti', label: 'Partecipanti', href: '/persone/partecipanti' },
        { id: 'relatori', label: 'Relatori', href: '/persone/relatori' },
        { id: 'sponsor', label: 'Sponsor', href: '/persone/sponsor' },
        { id: 'staff', label: 'Staff', href: '/persone/staff' }
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: DollarSign,
      children: [
        { id: 'budget', label: 'Budget Overview', href: '/finance' },
        { id: 'report', label: 'Report', href: '/finance/report' }
      ]
    },
    { id: 'impostazioni', label: 'Impostazioni', icon: Settings, href: '/impostazioni' }
  ];

  // CLIENT STATE: Mobile menu and section expansion
  const [expandedSections, setExpandedSections] = useState(['eventi', 'persone', 'finance']);

  const toggleSection = (id) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Event Manager</h1>
          <button onClick={onMobileClose} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navigation.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedSections.includes(item.id) ? 'rotate-90' : ''}`} />
                  </button>
                  {expandedSections.includes(item.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            onNavigate(child.href);
                            onMobileClose();
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                            currentPage === child.href
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    onNavigate(item.href);
                    onMobileClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === item.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

/**
 * Header Component - components/dashboard/layout/Header.tsx
 * TYPE: CLIENT COMPONENT ("use client")
 * REASON: Mobile menu toggle button requires onClick handler
 * PROPS: onMobileMenuToggle (function)
 * 
 * ALTERNATIVE: Can be Server Component if mobile toggle is managed in parent layout
 */
const Header = ({ onMobileMenuToggle }) => (
  <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
    <button onClick={onMobileMenuToggle} className="lg:hidden">
      <Menu className="h-6 w-6" />
    </button>
    <div className="flex items-center gap-4 ml-auto">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
          A
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium">Admin User</p>
          <p className="text-xs text-gray-500">admin@eventmgr.com</p>
        </div>
      </div>
    </div>
  </header>
);

// ============================================================================
// HOME PAGE COMPONENTS - MOVE TO: components/dashboard/home/
// ============================================================================

/**
 * DashboardHome Component - app/(dashboard)/page.tsx
 * TYPE: Server Component (async)
 * REASON: Fetches data from database (no user interaction, just display)
 * 
 * DATA FETCHING PATTERN:
 * async function DashboardHome() {
 *   // Fetch from database using DAL (Data Access Layer)
 *   const upcomingEvents = await getUpcomingEvents();
 *   const urgentDeadlines = await getUrgentDeadlines();
 *   const stats = await getDashboardStats();
 *   
 *   return (
 *     <div className="space-y-8">
 *       <UrgentDeadlines deadlines={urgentDeadlines} />
 *       <StatsOverview stats={stats} />
 *       <UpcomingEvents events={upcomingEvents} />
 *     </div>
 *   );
 * }
 * 
 * SPLIT INTO SUB-COMPONENTS:
 * - UrgentDeadlines.tsx (Server Component, receives data as props)
 * - StatsOverview.tsx (Server Component)
 * - UpcomingEvents.tsx (Server Component)
 */
const DashboardHome = () => {
  const upcomingEvents = mockEvents
    .filter(e => e.status === 'upcoming' || e.status === 'active')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  // UTILITY FUNCTION - Move to lib/utils.ts
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // UTILITY FUNCTION - Move to lib/utils.ts
  const getDaysUntil = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Scaduto';
    if (days === 0) return 'Oggi';
    if (days === 1) return 'Domani';
    return `${days} giorni`;
  };

  return (
    <div className="space-y-8">
      {/* SPLIT: UrgentDeadlines Component - components/dashboard/home/UrgentDeadlines.tsx */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900">Scadenze Urgenti</h2>
        </div>
        <div className="space-y-3">
          {mockDeadlines.slice(0, 5).map((deadline) => (
            <Card key={deadline.id} className={`p-4 border-l-4 ${getPriorityColor(deadline.priority)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                    <Badge variant={deadline.priority === 'high' ? 'error' : deadline.priority === 'medium' ? 'warning' : 'default'}>
                      {deadline.priority === 'high' ? 'Urgente' : deadline.priority === 'medium' ? 'Media' : 'Bassa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{deadline.eventName}</p>
                  <p className="text-sm text-gray-500">{deadline.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-gray-900">{getDaysUntil(deadline.dueDate)}</p>
                  <p className="text-xs text-gray-500">{new Date(deadline.dueDate).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SPLIT: StatsOverview Component - components/dashboard/home/StatsOverview.tsx */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Panoramica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventi Attivi</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.activeEvents}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partecipanti Totali</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.totalParticipants}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Utilizzato</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.budgetUsed}%</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Relatori Confermati</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.confirmedSpeakers}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* SPLIT: UpcomingEvents Component - components/dashboard/home/UpcomingEvents.tsx */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Prossimi Eventi (30 giorni)</h2>
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                    <Badge variant={event.status === 'active' ? 'success' : 'blue'}>
                      {event.status === 'active' ? 'In corso' : 'Prossimo'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.startDate).toLocaleDateString('it-IT')} - {new Date(event.endDate).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.registered}/{event.capacity} partecipanti</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">Budget</span>
                      <span className="text-xs font-medium text-gray-900">
                        €{event.spent.toLocaleString()} / €{event.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(event.spent / event.budget) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  Vai ai dettagli →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// EVENTS PAGE COMPONENTS - MOVE TO: components/dashboard/events/
// ============================================================================

/**
 * EventiLista Component - app/(dashboard)/eventi/page.tsx
 * TYPE: Server Component (async)
 * REASON: Fetches list of events from database
 * 
 * DATA FETCHING:
 * async function EventiLista() {
 *   const events = await getAllEvents(); // From DAL
 *   return <EventList events={events} />
 * }
 * 
 * SPLIT INTO:
 * - EventList.tsx (Server Component - displays list)
 * - EventCard.tsx (Server Component - individual event card)
 * - EventFilters.tsx (Client Component - filter controls)
 */
const EventiLista = ({ onNavigate }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Tutti gli Eventi</h1>
      <Button onClick={() => onNavigate('/eventi/nuovo')}>
        <Plus className="h-4 w-4 mr-2" />
        Crea Evento
      </Button>
    </div>

    <div className="space-y-4">
      {mockEvents.map((event) => (
        <Card key={event.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate(`/eventi/${event.id}`)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                <Badge variant={event.status === 'completed' ? 'default' : event.status === 'active' ? 'success' : 'blue'}>
                  {event.status === 'completed' ? 'Completato' : event.status === 'active' ? 'In corso' : 'Prossimo'}
                </Badge>
                <Badge>{event.type}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-3">
                <div>
                  <span className="font-medium">Data:</span> {new Date(event.startDate).toLocaleDateString('it-IT')}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {event.location}
                </div>
                <div>
                  <span className="font-medium">Partecipanti:</span> {event.registered}/{event.capacity}
                </div>
                <div>
                  <span className="font-medium">Budget:</span> €{event.spent.toLocaleString()}/€{event.budget.toLocaleString()}
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/**
 * EventoDettaglio Component - app/(dashboard)/eventi/[id]/[tab]/page.tsx
 * TYPE: Server Component (async)
 * REASON: Fetches event data from database
 * 
 * IMPLEMENTATION PATTERN:
 * async function EventoDettaglio({ params }) {
 *   const { id, tab } = await params;
 *   const event = await getEventById(id);
 *   
 *   return (
 *     <>
 *       <EventHeader event={event} />
 *       <EventTabs currentTab={tab} eventId={id} />
 *       {renderTabContent(tab, event)}
 *     </>
 *   );
 * }
 * 
 * SPLIT INTO:
 * - EventHeader.tsx (Server Component - event info header)
 * - EventTabs.tsx (CLIENT Component - tab navigation with active state)
 * - tabs/OverviewTab.tsx, ParticipantsTab.tsx, etc. (Server Components)
 */
const EventoDettaglio = ({ eventId, currentTab, onNavigate }) => {
  const event = mockEvents.find(e => e.id === eventId);
  if (!event) return <div>Evento non trovato</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'partecipanti', label: 'Partecipanti' },
    { id: 'relatori', label: 'Relatori' },
    { id: 'sponsor', label: 'Sponsor' },
    { id: 'programma', label: 'Programma' },
    { id: 'servizi', label: 'Servizi & Fornitori' },
    { id: 'budget', label: 'Budget' },
    { id: 'comunicazioni', label: 'Comunicazioni' },
    { id: 'questionari', label: 'Questionari' },
    { id: 'checkin', label: 'Check-in' }
  ];

  return (
    <div className="space-y-6">
      {/* SPLIT: EventHeader Component - components/dashboard/events/EventHeader.tsx */}
      <div>
        <button onClick={() => onNavigate('/eventi')} className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1">
          ← Torna a Eventi
        </button>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.startDate).toLocaleDateString('it-IT')} - {new Date(event.endDate).toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Modifica</Button>
              <Button variant="outline" size="sm">Duplica</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <span className="text-sm text-gray-600">Partecipanti</span>
              <p className="text-lg font-semibold text-gray-900">{event.registered}/{event.capacity}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Budget</span>
              <p className="text-lg font-semibold text-gray-900">€{event.spent.toLocaleString()}/€{event.budget.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* SPLIT: EventTabs Component - components/dashboard/events/EventTabs.tsx 
          TYPE: CLIENT COMPONENT ("use client")
          REASON: Needs to track active tab state for visual highlighting
          
          ALTERNATIVE IN NEXT.JS 16:
          Use Link components with pathname checking:
          const pathname = usePathname(); // from 'next/navigation'
          <Link href={`/eventi/${eventId}/overview`} className={pathname.includes('overview') ? 'active' : ''}>
      */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onNavigate(`/eventi/${eventId}/${tab.id}`)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - Each tab should be a separate Server Component */}
      <div>
        {currentTab === 'overview' && <TabOverview event={event} />}
        {currentTab === 'partecipanti' && <TabPartecipanti />}
        {currentTab === 'relatori' && <TabRelatori />}
        {currentTab === 'sponsor' && <TabSponsor />}
        {currentTab === 'programma' && <TabProgramma />}
        {currentTab === 'servizi' && <TabServizi />}
        {currentTab === 'budget' && <TabBudget event={event} />}
        {currentTab === 'comunicazioni' && <TabComunicazioni />}
        {currentTab === 'questionari' && <TabQuestionari />}
        {currentTab === 'checkin' && <TabCheckin />}
      </div>
    </div>
  );
};

// ============================================================================
// EVENT TAB COMPONENTS - MOVE TO: components/dashboard/events/tabs/
// ============================================================================

/**
 * TabOverview - components/dashboard/events/tabs/OverviewTab.tsx
 * TYPE: Server Component (async)
 * REASON: Displays static data fetched from database
 * 
 * DATA FETCHING:
 * async function OverviewTab({ eventId }) {
 *   const event = await getEventById(eventId);
 *   const timeline = await getEventTimeline(eventId);
 *   return <OverviewContent event={event} timeline={timeline} />
 * }
 */
const TabOverview = ({ event }) => (
  <div className="space-y-6">
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Evento</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-600">Tipo Evento</dt>
          <dd className="mt-1 text-sm text-gray-900">{event.type}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-600">Stato</dt>
          <dd className="mt-1">
            <Badge variant={event.status === 'completed' ? 'default' : event.status === 'active' ? 'success' : 'blue'}>
              {event.status === 'completed' ? 'Completato' : event.status === 'active' ? 'In corso' : 'Prossimo'}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-600">Capacità Massima</dt>
          <dd className="mt-1 text-sm text-gray-900">{event.capacity} persone</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-600">Iscritti</dt>
          <dd className="mt-1 text-sm text-gray-900">{event.registered} persone</dd>
        </div>
      </dl>
    </Card>

    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Evento</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Evento Creato</p>
            <p className="text-sm text-gray-600">15 giorni fa</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Iscrizioni Aperte</p>
            <p className="text-sm text-gray-600">10 giorni fa</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="h-2 w-2 bg-gray-300 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Data Evento</p>
            <p className="text-sm text-gray-600">{new Date(event.startDate).toLocaleDateString('it-IT')}</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

/**
 * TabPartecipanti - components/dashboard/events/tabs/ParticipantsTab.tsx
 * TYPE: Hybrid (Server Component wrapper + Client Component for table interactions)
 * 
 * RECOMMENDED STRUCTURE:
 * // ParticipantsTab.tsx (Server Component - async)
 * async function ParticipantsTab({ eventId }) {
 *   const participants = await getEventParticipants(eventId);
 *   return <ParticipantsTable participants={participants} eventId={eventId} />
 * }
 * 
 * // ParticipantsTable.tsx (Client Component)
 * "use client";
 * function ParticipantsTable({ participants, eventId }) {
 *   const [filter, setFilter] = useState('');
 *   const [sortBy, setSortBy] = useState('name');
 *   // Filter and sort logic
 *   return <table>...</table>
 * }
 */
const TabPartecipanti = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Lista Partecipanti</h3>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Aggiungi Partecipante
      </Button>
    </div>
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Iscrizione</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">Mario Rossi</td>
                <td className="px-6 py-4 text-sm text-gray-600">mario.rossi@email.com</td>
                <td className="px-6 py-4">
                  <Badge variant="success">Confermato</Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">20/10/2025</td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="sm">Dettagli</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

/**
 * TabRelatori - components/dashboard/events/tabs/SpeakersTab.tsx
 * TYPE: Server Component (async)
 * REASON: Display-only list of speakers
 */
const TabRelatori = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Relatori</h3>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Aggiungi Relatore
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              DR
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Dr. Giuseppe Verdi</h4>
              <p className="text-sm text-gray-600">Cardiologo</p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="success">Confermato</Badge>
                <Badge>Materiali inviati</Badge>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/**
 * TabSponsor - components/dashboard/events/tabs/SponsorsTab.tsx
 * TYPE: Server Component (async)
 */
const TabSponsor = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Sponsor</h3>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Aggiungi Sponsor
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { name: 'PharmaCorp', budget: 15000, tier: 'Gold' },
        { name: 'MedTech Solutions', budget: 10000, tier: 'Silver' }
      ].map((sponsor, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">{sponsor.name}</h4>
              <p className="text-sm text-gray-600">Budget: €{sponsor.budget.toLocaleString()}</p>
            </div>
            <Badge variant={sponsor.tier === 'Gold' ? 'warning' : 'default'}>{sponsor.tier}</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">• Tavolo espositivo</p>
            <p className="text-gray-600">• Logo su materiali</p>
            <p className="text-gray-600">• Spazio brochure</p>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/**
 * TabProgramma - components/dashboard/events/tabs/AgendaTab.tsx
 * TYPE: Server Component (async)
 * NOTE: Agenda editing could be split into a Client Component form
 */
const TabProgramma = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Programma Evento</h3>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Aggiungi Sessione
      </Button>
    </div>
    <Card className="p-6">
      <div className="space-y-4">
        {[
          { time: '09:00 - 09:30', title: 'Registrazione e Welcome Coffee', speaker: '-' },
          { time: '09:30 - 10:30', title: 'Innovazioni in Cardiologia Interventistica', speaker: 'Dr. Giuseppe Verdi' },
          { time: '10:30 - 11:00', title: 'Coffee Break', speaker: '-' },
          { time: '11:00 - 12:30', title: 'Tavola Rotonda: Prevenzione Cardiovascolare', speaker: 'Panel di esperti' }
        ].map((session, i) => (
          <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
            <div className="text-sm font-medium text-gray-600 w-32">{session.time}</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{session.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{session.speaker}</p>
            </div>
            <Button variant="ghost" size="sm">Modifica</Button>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

/**
 * TabServizi - components/dashboard/events/tabs/ServicesTab.tsx
 * TYPE: Server Component (async)
 */
const TabServizi = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Servizi e Fornitori</h3>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Aggiungi Servizio
      </Button>
    </div>
    <div className="space-y-4">
      {[
        { name: 'Catering Gourmet', type: 'Catering', status: 'confermato', preventivo: 8000, effettivo: 8000 },
        { name: 'Audio Video Pro', type: 'Audio/Video', status: 'in_attesa', preventivo: 5000, effettivo: 0 },
        { name: 'Palazzo Congressi Milano', type: 'Location', status: 'confermato', preventivo: 12000, effettivo: 6000 }
      ].map((service, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                <Badge>{service.type}</Badge>
                <Badge variant={service.status === 'confermato' ? 'success' : 'warning'}>
                  {service.status === 'confermato' ? 'Confermato' : 'In attesa'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                <div>
                  <span className="text-gray-600">Preventivo:</span>
                  <span className="ml-2 font-medium">€{service.preventivo.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Speso:</span>
                  <span className="ml-2 font-medium">€{service.effettivo.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">Contratto</Button>
              <Button variant="ghost" size="sm">Dettagli</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/**
 * TabBudget - components/dashboard/events/tabs/BudgetTab.tsx
 * TYPE: Server Component (async)
 * NOTE: Export buttons could trigger Server Actions
 */
const TabBudget = ({ event }) => (
  <div className="space-y-6">
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Budget</h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Budget Totale</span>
            <span className="text-lg font-bold text-gray-900">€{event.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Speso</span>
            <span className="text-lg font-bold text-blue-600">€{event.spent.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Rimanente</span>
            <span className="text-lg font-bold text-green-600">€{(event.budget - event.spent).toLocaleString()}</span>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${(event.spent / event.budget) * 100}%` }}
          />
        </div>
      </div>
    </Card>

    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dettaglio per Categoria</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preventivo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Effettivo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Delta</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { category: 'Location', preventivo: 12000, effettivo: 12000 },
              { category: 'Catering', preventivo: 8000, effettivo: 8000 },
              { category: 'Audio/Video', preventivo: 5000, effettivo: 4500 },
              { category: 'Marketing', preventivo: 3000, effettivo: 2500 },
              { category: 'Altro', preventivo: 2000, effettivo: 1000 }
            ].map((item, i) => {
              const delta = item.effettivo - item.preventivo;
              const percentage = (item.effettivo / item.preventivo) * 100;
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">€{item.preventivo.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">€{item.effettivo.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-sm text-right font-medium ${delta > 0 ? 'text-red-600' : delta < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {delta > 0 ? '+' : ''}€{delta.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{percentage.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>

    {/* NOTE: Export buttons should trigger Server Actions for PDF/Excel generation */}
    <div className="flex gap-4">
      <Button variant="outline">
        <FileText className="h-4 w-4 mr-2" />
        Esporta Excel
      </Button>
      <Button variant="outline">
        <FileText className="h-4 w-4 mr-2" />
        Esporta PDF
      </Button>
    </div>
  </div>
);

/**
 * TabComunicazioni - components/dashboard/events/tabs/CommunicationsTab.tsx
 * TYPE: Server Component (