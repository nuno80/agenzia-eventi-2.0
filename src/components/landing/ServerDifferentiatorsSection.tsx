// src/components/landing/ServerDifferentiatorsSection.tsx
// Server Component version of DifferentiatorsSection - no interactivity needed

import { GraduationCap, Target, TrendingUp, Video } from 'lucide-react'
import React from 'react'

const differentiators = [
  {
    icon: Target,
    title: 'Esperienza in Eventi Complessi',
    description: 'Background in eventi medici ECM: la stessa precisione per il tuo business',
  },
  {
    icon: Video,
    title: 'Nativi Digitali',
    description: 'Eventi ibridi e piattaforme online: raggiungi più clienti con meno budget',
  },
  {
    icon: GraduationCap,
    title: 'Formazione Integrata',
    description: 'Formiamo il tuo team per brillare: public speaking, portamento, networking',
  },
  {
    icon: TrendingUp,
    title: 'Focus PMI',
    description: 'Budget ottimizzati 5-15k: massimo risultato, zero spreco',
  },
]

const ServerDifferentiatorsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Perché Siamo Diversi
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Non solo organizziamo eventi: creiamo ecosistemi integrati che generano risultati
            misurabili per il tuo business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {differentiators.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="hover:scale-105 transition-transform duration-300">
                <div className="bg-slate-50 rounded-xl p-6 h-full border border-slate-200 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300">
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ServerDifferentiatorsSection
