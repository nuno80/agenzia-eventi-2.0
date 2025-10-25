// src/components/landing/ServerProcessSection.tsx
// Server Component version of ProcessSection - no interactivity needed

import React from 'react'

const processSteps = [
  { title: 'Briefing', description: 'Analizziamo obiettivi, target e budget' },
  { title: 'Strategia', description: 'Progettiamo soluzioni su misura' },
  { title: 'Execution', description: 'Realizziamo con precisione ECM' },
  { title: 'Follow-up', description: 'Misuriamo risultati e ROI' },
]

const ServerProcessSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Il Nostro Metodo</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Quattro fasi per trasformare la tua idea in un evento di successo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {processSteps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="text-center">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
              {idx < processSteps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-amber-500 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServerProcessSection
