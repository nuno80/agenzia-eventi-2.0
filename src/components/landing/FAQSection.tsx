"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Quali tipi di eventi organizzate?',
    a: 'Siamo specializzati in eventi corporate per PMI: congressi aziendali, convention, team building, corsi di formazione, eventi ibridi e online. Non organizziamo eventi privati come matrimoni o feste.'
  },
  {
    q: 'Quanto costa organizzare un evento con voi?',
    a: 'I nostri servizi sono ottimizzati per PMI con budget 5-15k per evento. Il costo dipende da dimensioni, location, tecnologia e servizi aggiuntivi. Offriamo preventivi gratuiti personalizzati.'
  },
  {
    q: 'Cosa significa "esperienza ECM"?',
    a: 'Abbiamo organizzato eventi medici con accreditamento ECM (Educazione Continua in Medicina), che richiedono precisione assoluta, gestione complessa e standard elevati. Applichiamo la stessa metodologia ai tuoi eventi business.'
  },
  {
    q: 'Offrite anche eventi completamente online?',
    a: 'Sì! Siamo specialisti in eventi digitali e ibridi. Utilizziamo piattaforme professionali, streaming multi-camera, interazione live e registrazioni on-demand per massimizzare reach e contenimento costi.'
  },
  {
    q: 'Che tipo di formazione offrite?',
    a: 'Offriamo corsi di public speaking, portamento professionale, business etiquette e preparazione pitch. Possiamo integrare la formazione con l\'organizzazione del tuo evento per risultati ottimali.'
  }
];

const FAQSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Domande Frequenti
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group">
              <summary className="p-6 cursor-pointer font-semibold text-slate-900 hover:text-amber-600 transition-colors flex justify-between items-center">
                {faq.q}
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 border-t border-slate-200 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;