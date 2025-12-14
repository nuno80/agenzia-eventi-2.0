import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'

export default function ProcessPage() {
  const steps = [
    {
      step: '01',
      title: 'Consultazione Iniziale',
      description:
        "Ascoltiamo le tue esigenze, obiettivi e budget per definire la visione dell'evento.",
    },
    {
      step: '02',
      title: 'Pianificazione Strategica',
      description:
        'Sviluppiamo un piano dettagliato, inclusi concept, timeline e selezione dei fornitori.',
    },
    {
      step: '03',
      title: 'Esecuzione e Gestione',
      description:
        'Organizziamo ogni aspetto logistico e operativo, coordinando il team e le risorse.',
    },
    {
      step: '04',
      title: "Svolgimento dell'Evento",
      description:
        'Supervisione in loco per garantire che tutto proceda come pianificato e risolvere imprevisti.',
    },
    {
      step: '05',
      title: 'Analisi Post-Evento',
      description:
        "Valutiamo il successo dell'evento, raccogliamo feedback e forniamo report dettagliati.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-slate-900 py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 pattern-dots-md opacity-20"></div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">
          Il Nostro <span className="text-amber-500">Processo</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-300 relative z-10">
          Un metodo collaudato per trasformare le tue idee in eventi di successo, passo dopo passo.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {steps.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-8 items-start relative">
              {index !== steps.length - 1 && (
                <div className="hidden md:block absolute left-[27px] top-16 bottom-[-48px] w-0.5 bg-slate-200"></div>
              )}
              <div className="flex-shrink-0 w-14 h-14 bg-white border-2 border-amber-500 rounded-full flex items-center justify-center text-amber-600 font-bold text-xl shadow-lg z-10">
                {item.step}
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex-grow hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/contatti"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-xl"
          >
            Inizia Ora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
