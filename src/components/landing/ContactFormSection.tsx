'use client'

import { MessageCircle } from 'lucide-react'
import { type FormEvent, useState } from 'react'

interface FormData {
  name: string
  email: string
  phone: string
  eventType: string
  message: string
}

const ContactFormSection = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    message: '',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const whatsappMessage = `Ciao! Sono ${formData.name}. Interessato a: ${formData.eventType}. Email: ${formData.email}, Tel: ${formData.phone}. Messaggio: ${formData.message}`
    window.open(`https://wa.me/393401234567?text=${encodeURIComponent(whatsappMessage)}`, '_blank')
  }

  return (
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nome e Cognome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  placeholder="mario.rossi@azienda.it"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Telefono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  placeholder="+39 340 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tipo di Evento *
                </label>
                <select
                  required
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
  )
}

export default ContactFormSection
