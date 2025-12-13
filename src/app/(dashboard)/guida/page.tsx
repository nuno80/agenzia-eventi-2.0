/**
 * FILE: src/app/(dashboard)/guida/page.tsx
 * TYPE: Server Component
 * WHY: Static documentation page, no client-side interactivity needed
 *
 * FEATURES:
 * - Comprehensive guide for all dashboard sections
 * - Accordion-based navigation
 * - Examples and best practices
 */

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Euro,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Users,
} from 'lucide-react'

export const metadata = {
  title: 'Guida | EventHub',
  description: "Guida completa all'utilizzo della dashboard EventHub",
}

interface GuideSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  features: string[]
  howTo: string[]
  tips: string[]
}

const sections: GuideSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <LayoutDashboard className="w-6 h-6" />,
    description:
      'La Dashboard è la tua homepage e mostra una panoramica rapida di tutti gli eventi, le scadenze urgenti e le statistiche principali.',
    features: [
      'Visualizzazione eventi imminenti con countdown',
      'Widget scadenze urgenti (deadline rosse = critiche)',
      'Statistiche globali: eventi totali, partecipanti, revenue',
      'Accesso rapido alle azioni più comuni',
    ],
    howTo: [
      'Accedi alla dashboard dal menu laterale cliccando su "Dashboard"',
      'Controlla il widget "Scadenze Urgenti" ogni mattina',
      'Clicca su un evento per andare direttamente al dettaglio',
    ],
    tips: [
      'Le scadenze in rosso richiedono attenzione immediata',
      'Il contatore di giorni ti aiuta a pianificare con anticipo',
    ],
  },
  {
    id: 'eventi',
    title: 'Eventi',
    icon: <Calendar className="w-6 h-6" />,
    description:
      'Gestisci tutti i tuoi eventi: congressi, formazioni, meeting ed eventi ibridi. Ogni evento ha 10 tab per gestire ogni aspetto.',
    features: [
      'Lista eventi con filtri (stato, data, tipo)',
      'Creazione nuovo evento con form guidato',
      'Duplicazione eventi esistenti per velocizzare la creazione',
      '10 Tab per ogni evento: Overview, Partecipanti, Relatori, Sponsor, Agenda, Servizi, Budget, Comunicazioni, Sondaggi, Check-in',
    ],
    howTo: [
      'Clicca "Nuovo Evento" per creare un evento',
      'Compila i campi obbligatori: nome, date, location',
      'Usa i tab per aggiungere partecipanti, relatori, sponsor',
      "Configura l'agenda con le sessioni",
      'Gestisci il budget con categorie di spesa/entrata',
    ],
    tips: [
      'Usa "Duplica Evento" per eventi ricorrenti - risparmierai tempo',
      'Configura prima il budget, poi aggiungi relatori/sponsor - i costi si collegheranno automaticamente',
      'Il tab Check-in permette scansione QR code per registrazione veloce',
    ],
  },
  {
    id: 'persone',
    title: 'Persone',
    icon: <Users className="w-6 h-6" />,
    description:
      'Gestisci tutti i contatti: partecipanti, relatori, sponsor e staff. Ogni categoria ha la sua pagina dedicata.',
    features: [
      'Partecipanti: lista globale di tutti i partecipanti a tutti gli eventi',
      'Relatori: database speaker con bio, foto, fee',
      'Sponsor: aziende sponsor con livelli (Gold, Silver, Bronze) e contratti',
      'Staff: personale operativo con ruoli, disponibilità e pagamenti',
    ],
    howTo: [
      'Vai su Persone → Partecipanti per vedere tutti i partecipanti',
      'Usa i filtri per cercare per evento, stato registrazione, ecc.',
      'Esporta in CSV per elaborazioni esterne',
      'Per lo Staff: gestisci pagamenti e assegnazioni agli eventi',
    ],
    tips: [
      'I relatori possono essere riutilizzati tra eventi diversi',
      'Traccia lo stato pagamento dello staff dal badge colorato',
      'Collega sponsor al budget per tracciare le entrate automaticamente',
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: <Euro className="w-6 h-6" />,
    description:
      'Panoramica finanziaria globale di tutti gli eventi. Monitora entrate, uscite e profitto in tempo reale.',
    features: [
      'Overview con KPI: revenue totale, costi, profitto',
      'Grafici a torta e barre per visualizzare la distribuzione',
      'Tabella eventi con breakdown finanziario',
      'Filtri per periodo e stato evento',
    ],
    howTo: [
      'Accedi da Finance nel menu laterale',
      'Usa i filtri data per analizzare periodi specifici',
      'Clicca su un evento per vedere il dettaglio budget',
    ],
    tips: [
      'Controlla regolarmente il margine di profitto per evento',
      'Le entrate da sponsor si collegano automaticamente se configurate correttamente',
    ],
  },
  {
    id: 'report',
    title: 'Report',
    icon: <FileText className="w-6 h-6" />,
    description:
      'Genera report finanziari personalizzati con filtri avanzati. Esporta in CSV per analisi esterne.',
    features: [
      'Filtri per intervallo date',
      'Selezione multipla eventi',
      'Breakdown per categoria di spesa',
      'Breakdown per evento',
      'Export CSV con un click',
    ],
    howTo: [
      'Seleziona il periodo di interesse (date inizio/fine)',
      'Scegli gli eventi da includere nel report',
      'Clicca "Genera Report" per visualizzare i dati',
      'Usa "Esporta CSV" per scaricare i dati',
    ],
    tips: [
      "Genera report mensili per tenere traccia dell'andamento",
      'Confronta eventi simili per identificare inefficienze',
      'Il CSV è compatibile con Excel per analisi avanzate',
    ],
  },
  {
    id: 'files',
    title: 'Files',
    icon: <FolderOpen className="w-6 h-6" />,
    description:
      'Gestione centralizzata di tutti i file: contratti, fatture, presentazioni, immagini.',
    features: [
      'Upload file multipli (drag & drop supportato)',
      'Organizzazione per evento',
      'Preview immagini e PDF',
      'Download diretto',
    ],
    howTo: [
      "Trascina i file nell'area di upload",
      'Oppure clicca per selezionare dal computer',
      'I file vengono salvati su Vercel Blob (cloud)',
    ],
    tips: [
      'Nomina i file in modo descrittivo per trovarli facilmente',
      'Supporta: immagini (JPG, PNG, WebP), documenti (PDF, DOC, XLS)',
      'Limite: 15MB per file',
    ],
  },
  {
    id: 'impostazioni',
    title: 'Impostazioni',
    icon: <Settings className="w-6 h-6" />,
    description: "Configura il profilo dell'organizzazione e le preferenze di notifica.",
    features: [
      'Profilo: nome organizzazione, contatti, logo, fuso orario',
      'Notifiche: attiva/disattiva email, imposta anticipo scadenze',
      'Template Email: personalizza i template per comunicazioni',
    ],
    howTo: [
      "Compila i dati dell'organizzazione nel tab Profilo",
      'Configura le preferenze email nel tab Notifiche',
      'Le modifiche vengono salvate automaticamente nel database',
    ],
    tips: [
      "Imposta l'anticipo notifiche scadenze a 7 giorni per avere tempo di agire",
      'Attiva il digest settimanale per un riepilogo ogni lunedì o venerdì',
    ],
  },
]

function GuideCard({ section }: { section: GuideSection }) {
  return (
    <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">{section.icon}</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{section.description.slice(0, 80)}...</p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
      </summary>

      <div className="px-6 pb-6 space-y-6 border-t border-gray-100">
        {/* Description */}
        <p className="text-gray-700 pt-4">{section.description}</p>

        {/* Features */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Funzionalità
          </h3>
          <ul className="space-y-2">
            {section.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-600">
                <span className="text-green-500 mt-1">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* How To */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Come Usare
          </h3>
          <ol className="space-y-2">
            {section.howTo.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 rounded-lg p-4">
          <h3 className="flex items-center gap-2 font-semibold text-amber-800 mb-3">
            <Lightbulb className="w-5 h-5" />
            Suggerimenti
          </h3>
          <ul className="space-y-2">
            {section.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-amber-700 text-sm">
                <span className="text-amber-500 mt-0.5">💡</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}

export default function GuidaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Guida EventHub</h1>
        <p className="mt-2 text-gray-600">
          Tutto quello che devi sapere per utilizzare al meglio la dashboard
        </p>
      </div>

      {/* Quick Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-8">
        <h2 className="text-xl font-semibold mb-4">🚀 Panoramica Rapida</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="font-medium mb-1">Eventi</div>
            <div className="text-blue-100">
              Crea e gestisci tutti i tuoi eventi con 10 tab dedicati
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="font-medium mb-1">Persone</div>
            <div className="text-blue-100">Gestisci partecipanti, relatori, sponsor e staff</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="font-medium mb-1">Finance</div>
            <div className="text-blue-100">Monitora budget, entrate e genera report</div>
          </div>
        </div>
      </div>

      {/* Guide Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <GuideCard key={section.id} section={section} />
        ))}
      </div>

      {/* Footer Help */}
      <div className="bg-gray-50 rounded-lg p-6 text-center mt-8">
        <p className="text-gray-600">
          Hai bisogno di ulteriore assistenza?{' '}
          <a href="mailto:supporto@eventhub.it" className="text-blue-600 hover:underline">
            Contatta il supporto
          </a>
        </p>
      </div>
    </div>
  )
}
