'use client'

import { Mail, MapPin, Phone } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-amber-400">EventiPro Roma</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Agenzia specializzata in organizzazione eventi corporate, formazione aziendale ed
              eventi ibridi per PMI a Roma. Con la precisione degli eventi ECM, al servizio del tuo
              business.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-slate-300">Roma, Lazio - Italia</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a
                  href="tel:+393401234567"
                  className="text-slate-300 hover:text-amber-400 transition-colors"
                >
                  +39 340 123 4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <a
                  href="mailto:info@eventipro-roma.it"
                  className="text-slate-300 hover:text-amber-400 transition-colors"
                >
                  info@eventipro-roma.it
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4">Servizi</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#services"
                  className="text-slate-300 hover:text-amber-400 transition-colors"
                >
                  Eventi Aziendali
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-slate-300 hover:text-amber-400 transition-colors"
                >
                  Eventi Online & Ibridi
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-slate-300 hover:text-amber-400 transition-colors"
                >
                  Formazione Corporate
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-slate-300 hover:text-amber-400 transition-colors"
                >
                  Hostess & Personale
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-slate-300 hover:text-amber-400 transition-colors"
                >
                  Congressi ECM
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Link Utili</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#services"
                  className="text-slate-300 hover:text-amber-400 transition-colors"
                >
                  Chi Siamo
                </a>
              </li>
              <li>
                <a
                  href="#contact-form"
                  className="text-slate-300 hover:text-amber-400 transition-colors"
                >
                  Contatti
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
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
  )
}

export default Footer
