import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'

export default function ServicesPage() {
  const services = [
    {
      title: 'Gestione Eventi Completa',
      description:
        "Dalla pianificazione all'esecuzione, ci occupiamo di ogni dettaglio per garantire il successo del tuo evento.",
    },
    {
      title: 'Design e Concettualizzazione',
      description:
        'Creiamo concept unici e design innovativi per rendere il tuo evento memorabile e visivamente impattante.',
    },
    {
      title: 'Logistica e Coordinamento',
      description:
        'Gestione impeccabile di location, trasporti, catering e staff per un flusso di lavoro senza intoppi.',
    },
    {
      title: 'Tecnologia e Produzione',
      description:
        "Soluzioni audio/video all'avanguardia, streaming e supporto tecnico per eventi ibridi e in presenza.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {/* Header */}
      <div className="bg-slate-900 py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/20 pattern-grid-lg opacity-20"></div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">
          I Nostri <span className="text-amber-500">Servizi</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-300 relative z-10">
          Offriamo soluzioni personalizzate per ogni tipo di evento aziendale, garantendo
          professionalità e risultati d'eccellenza.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle2 className="text-amber-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/contatti"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/20"
          >
            Richiedi un Preventivo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
