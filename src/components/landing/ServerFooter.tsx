// src/components/landing/ServerFooter.tsx
// Server Component version of Footer - no interactivity needed

import { Mail, MapPin, Phone } from 'lucide-react'
import React from 'react'

const ServerFooter = () => {
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
                <span className="text-slate-300">+39 340 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-slate-300">info@eventipro-roma.it</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4">Servizi</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-300">Eventi Aziendali</span>
              </li>
              <li>
                <span className="text-slate-300">Eventi Online & Ibridi</span>
              </li>
              <li>
                <span className="text-slate-300">Formazione Corporate</span>
              </li>
              <li>
                <span className="text-slate-300">Hostess & Personale</span>
              </li>
              <li>
                <span className="text-slate-300">Congressi ECM</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Link Utili</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-300">Chi Siamo</span>
              </li>
              <li>
                <span className="text-slate-300">Contatti</span>
              </li>
              <li>
                <span className="text-slate-300">Portfolio</span>
              </li>
              <li>
                <span className="text-slate-300">Blog</span>
              </li>
              <li>
                <span className="text-slate-300">Privacy Policy</span>
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
              <span className="text-slate-400 text-sm">Privacy Policy</span>
              <span className="text-slate-400 text-sm">Cookie Policy</span>
              <span className="text-slate-400 text-sm">Termini di Servizio</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default ServerFooter
