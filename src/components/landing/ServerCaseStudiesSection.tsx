// src/components/landing/ServerCaseStudiesSection.tsx
// Server Component version of CaseStudiesSection - no interactivity needed

import React from 'react';

const caseStudies = [
  {
    title: 'Congresso Medico 300+ Partecipanti',
    description: 'Gestione completa: location, tecnologia, accreditamenti ECM, catering. Zero imprevisti.',
    results: ['300+ presenti', 'Accreditamento ECM', '98% soddisfazione']
  },
  {
    title: 'Lancio Prodotto Pharma - Formato Ibrido',
    description: 'Streaming professionale, Q&A interattivo, follow-up lead automatizzato.',
    results: ['150 in sala', '200 online', '85% engagement']
  },
  {
    title: 'Corso Formazione Leadership PMI',
    description: 'Workshop portamento e public speaking per manager. Coaching personalizzato.',
    results: ['30 manager', '12 ore formazione', '9.2/10 feedback']
  }
];

const ServerCaseStudiesSection = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Progetti Realizzati
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Esempi concreti di eventi gestiti con successo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((study, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-3">{study.title}</h3>
              <p className="text-slate-600 mb-4">{study.description}</p>
              <div className="flex flex-wrap gap-2">
                {study.results.map((result, ridx) => (
                  <span key={ridx} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                    {result}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServerCaseStudiesSection;