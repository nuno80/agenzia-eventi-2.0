"use client";

import React, { useState, FormEvent } from 'react';
import { Users, Video, GraduationCap, CheckCircle2, ArrowRight, Phone, Mail, MapPin, ChevronDown, MessageCircle, Sparkles, Target, Award, TrendingUp } from 'lucide-react';

const EventManagementLanding = () => {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    message: ''
  });
  const [isVisible] = useState(true);

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
        'Location corporate a Roma e dintorni'
      ]
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
        'Integrazione fisica + digitale seamless'
      ]
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
        'Certificazioni e materiali didattici'
      ]
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
        'Servizio premium per eventi VIP'
      ]
    }
  ];

  const differentiators = [
    {
      icon: Target,
      title: 'Esperienza in Eventi Complessi',
      description: 'Background in eventi medici ECM: la stessa precisione per il tuo business'
    },
    {
      icon: Video,
      title: 'Nativi Digitali',
      description: 'Eventi ibridi e piattaforme online: raggiungi più clienti con meno budget'
    },
    {
      icon: GraduationCap,
      title: 'Formazione Integrata',
      description: 'Formiamo il tuo team per brillare: public speaking, portamento, networking'
    },
    {
      icon: TrendingUp,
      title: 'Focus PMI',
      description: 'Budget ottimizzati 5-15k: massimo risultato, zero spreco'
    }
  ];

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

  const stats = [
    { number: '15+', label: 'Anni Esperienza', sublabel: 'in event management' },
    { number: '200+', label: 'Eventi Gestiti', sublabel: 'inclusi ECM nazionali' },
    { number: '5.000+', label: 'Partecipanti', sublabel: 'coinvolti in eventi complessi' },
    { number: '100%', label: 'Dedicato', sublabel: 'a PMI e corporate' }
  ];

  const processSteps = [
    { title: 'Briefing', description: 'Analizziamo obiettivi, target e budget' },
    { title: 'Strategia', description: 'Progettiamo soluzioni su misura' },
    { title: 'Execution', description: 'Realizziamo con precisione ECM' },
    { title: 'Follow-up', description: 'Misuriamo risultati e ROI' }
  ];

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `Ciao! Sono ${formData.name}. Interessato a: ${formData.eventType}. Email: ${formData.email}, Tel: ${formData.phone}. Messaggio: ${formData.message}`;
    window.open(`https://wa.me/393401234567?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/393401234567?text=Ciao!%20Vorrei%20informazioni%20sui%20vostri%20servizi%20di%20organizzazione%20eventi', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJzLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyIDUuMzczLTEyIDEyLTEyem0wIDN2MThuYTkgOSAwIDAgMCAwIDAtMTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">Specialisti in Eventi Corporate a Roma</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Eventi Corporate che Generano
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600"> Risultati Concreti</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Con la precisione degli eventi medici ECM, organizziamo congressi, formazione aziendale ed eventi ibridi per PMI a Roma. Dal vivo, online o entrambi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  const element = document.getElementById('contact-form');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40"
              >
                Richiedi un Preventivo Gratuito
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('services');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300"
              >
                Scopri Come Lavoriamo
              </button>
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="relative bg-white/5 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <Award className="w-6 h-6 text-amber-400" />
                <span className="text-slate-200">Esperienza Eventi ECM</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <MapPin className="w-6 h-6 text-amber-400" />
                <span className="text-slate-200">Base a Roma</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Target className="w-6 h-6 text-amber-400" />
                <span className="text-slate-200">Focus PMI & Corporate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Perché Siamo Diversi
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Non solo organizziamo eventi: creiamo ecosistemi integrati che generano risultati misurabili per il tuo business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {differentiators.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="group hover:scale-105 transition-transform duration-300">
                  <div className="bg-slate-50 rounded-xl p-6 h-full border border-slate-200 hover:border-amber-500/50 hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              I Nostri Servizi
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Soluzioni complete per eventi corporate che funzionano: dal concept alla misurazione dei risultati
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              const isActive = activeService === service.id;
              
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
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Il Nostro Metodo
            </h2>
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

      {/* Case Studies */}
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

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">{stat.number}</div>
                <div className="text-xl font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-slate-400">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* Contact Form */}
      <section id="contact-form" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Richiedi un Preventivo Gratuito
            </h2>
            <p className="text-lg text-slate-600">
              Raccontaci del tuo progetto e ti ricontatteremo entro 24 ore
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nome e Cognome *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="Mario Rossi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="mario.rossi@azienda.it"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Telefono *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="+39 340 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo di Evento *</label>
                  <select
                    required
                    value={formData.eventType}
                    onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
                  >
                    <option value="">Seleziona...</option>
                    <option value="congresso">Congresso / Convention</option>
                    <option value="corporate">Evento Aziendale</option>
                    <option value="hostess">Servizio Hostess/Promoter</option>
                    <option value="formazione">Corso di Formazione</option>
                    <option value="ibrido">Evento Ibrido/Online</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Messaggio</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                  placeholder="Raccontaci brevemente del tuo progetto: data prevista, numero partecipanti, budget orientativo..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Invia Richiesta via WhatsApp
              </button>

              <p className="text-sm text-slate-500 text-center">
                Cliccando invierai i tuoi dati via WhatsApp Business. Rispettiamo la tua privacy.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 text-amber-400">EventiPro Roma</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Agenzia specializzata in organizzazione eventi corporate, formazione aziendale ed eventi ibridi per PMI a Roma. Con la precisione degli eventi ECM, al servizio del tuo business.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-300">Roma, Lazio - Italia</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <a href="tel:+393401234567" className="text-slate-300 hover:text-amber-400 transition-colors">
                    +39 340 123 4567
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <a href="mailto:info@eventipro-roma.it" className="text-slate-300 hover:text-amber-400 transition-colors">
                    info@eventipro-roma.it
                  </a>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-bold mb-4">Servizi</h4>
              <ul className="space-y-2">
                <li><a href="#services" className="text-slate-300 hover:text-amber-400 transition-colors">Eventi Aziendali</a></li>
                <li><a href="#services" className="text-slate-300 hover:text-amber-400 transition-colors">Eventi Online & Ibridi</a></li>
                <li><a href="#services" className="text-slate-300 hover:text-amber-400 transition-colors">Formazione Corporate</a></li>
                <li><a href="#services" className="text-slate-300 hover:text-amber-400 transition-colors">Hostess & Personale</a></li>
                <li><a href="#services" className="text-slate-300 hover:text-amber-400 transition-colors">Congressi ECM</a></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">Link Utili</h4>
              <ul className="space-y-2">
                <li><a href="#services" className="text-slate-300 hover:text-amber-400 transition-colors">Chi Siamo</a></li>
                <li><a href="#contact-form" className="text-slate-300 hover:text-amber-400 transition-colors">Contatti</a></li>
                <li><a href="#" className="text-slate-300 hover:text-amber-400 transition-colors">Portfolio</a></li>
                <li><a href="#" className="text-slate-300 hover:text-amber-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-300 hover:text-amber-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">
                © 2025 EventiPro Roma. P.IVA 12345678901 - Tutti i diritti riservati.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
                  Cookie Policy
                </a>
                <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
                  Termini di Servizio
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Contattaci su WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-16 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chatta con noi!
        </span>
      </button>
    </div>
  );
};

export default EventManagementLanding;