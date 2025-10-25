'use client'

import { Award, CheckCircle2, ChevronDown, GraduationCap, Users, Video } from 'lucide-react'
import React, { useState } from 'react'

const services = [
  {
    id: 'corporate',
    icon: Users,
    title: 'Eventi Aziendali & Congressi',
    subtitle: 'Trasforma il tuo evento in una macchina di lead generation',
    features: [
      'Gestione iscrizioni digitali e accreditamenti',
      'App evento con networking B2B integrato',
      'Tecnologia AV professionale e regia',
      'Follow-up automatizzato post-evento',
      'Location corporate a Roma e dintorni',
    ],
  },
  {
    id: 'hybrid',
    icon: Video,
    title: 'Eventi Online & Ibridi',
    subtitle: 'Raggiungi 10x partecipanti con 1/3 del budget',
    features: [
      'Piattaforme professionali (non solo Zoom)',
      'Streaming multi-camera e regia live',
      'Interazione in tempo reale (Q&A, poll, chat)',
      'Registrazioni e contenuti on-demand',
      'Integrazione fisica + digitale seamless',
    ],
  },
  {
    id: 'training',
    icon: GraduationCap,
    title: 'Formazione Corporate',
    subtitle: 'Non solo organizziamo: formiamo il tuo team per brillare',
    features: [
      'Corsi public speaking per speaker aziendali',
      'Workshop portamento e business etiquette',
      'Preparazione pitch e presentazioni efficaci',
      'Coaching personalizzato pre-evento',
      'Certificazioni e materiali didattici',
    ],
  },
  {
    id: 'staff',
    icon: Award,
    title: 'Hostess & Personale Qualificato',
    subtitle: 'Brand ambassador formati per eventi complessi',
    features: [
      'Personale selezionato e formato',
      'Hostess congressuali e promoter',
      'Accoglienza multilingue',
      'Gestione registrazioni e badge',
      'Servizio premium per eventi VIP',
    ],
  },
]

const ServicesSection = () => {
  const [activeService, setActiveService] = useState<string | null>(null)

  return (
    <section id="services" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">I Nostri Servizi</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Soluzioni complete per eventi corporate che funzionano: dal concept alla misurazione dei
            risultati
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const Icon = service.icon
            const isActive = activeService === service.id

            return (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setActiveService(isActive ? null : service.id)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-700 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{service.title}</h3>
                      <p className="text-slate-600">{service.subtitle}</p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {isActive && (
                    <div className="pt-4 border-t border-slate-100 space-y-2 animate-in slide-in-from-top duration-300">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
