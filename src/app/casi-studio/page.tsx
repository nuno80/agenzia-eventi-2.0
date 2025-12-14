import { ArrowRight, Trophy } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'

export default function CaseStudiesPage() {
  const cases = [
    {
      title: 'Tech Summit Roma 2024',
      category: 'Conferenza Tech',
      description:
        'Organizzazione completa per oltre 500 partecipanti internazionali, con gestione speaker e streaming globale.',
      result: 'Successo strepitoso con feedback positivo del 98%.',
    },
    {
      title: 'Lancio Prodotto Automotive',
      category: 'Lancio Prodotto',
      description:
        'Evento esclusivo per la presentazione del nuovo modello SUV, con allestimenti immersivi e test drive.',
      result: 'Copertura mediatica su tutte le principali testate del settore.',
    },
    {
      title: 'Gala Dinner Beneficenza',
      category: 'Gala',
      description:
        'Cena di gala per raccolta fondi con intrattenimento di alto profilo e gestione VIP.',
      result: 'Raccolti oltre 100.000€ per la fondazione.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-slate-900 py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20 pattern-grid-lg opacity-20"></div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">
          Casi <span className="text-amber-500">Studio</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-300 relative z-10">
          Esplora alcuni dei nostri progetti più recenti e scopri come abbiamo aiutato i nostri
          clienti a raggiungere i loro obiettivi.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group"
            >
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                {/* Placeholder for project image */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-slate-500">
                  <Trophy className="w-12 h-12 opacity-50" />
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                  {project.category}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">
                    Risultato: <span className="text-green-600 font-normal">{project.result}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/contatti"
            className="inline-flex items-center gap-2 border-2 border-slate-900 text-slate-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-slate-900 hover:text-white transition-all"
          >
            Vuoi un caso di successo anche tu?
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
