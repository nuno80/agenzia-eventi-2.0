// src/components/landing/ServerHeroSection.tsx
// Server Component version of HeroSection - simplified static version

import { ArrowRight, Award, Calendar, Users } from 'lucide-react'
import React from 'react'

const ServerHeroSection = () => {
  const stats = [
    { number: '15+', label: 'Anni Esperienza', icon: Award },
    { number: '200+', label: 'Eventi Gestiti', icon: Calendar },
    { number: '5.000+', label: 'Partecipanti', icon: Users },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-20 pb-32">
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 mb-8">
            <span className="text-sm font-medium text-amber-300">
              Specialisti in Eventi Corporate a Roma
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Eventi Corporate che</span>
            <br />
            <span className="inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                Generano Risultati Concreti
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Con la precisione degli eventi medici ECM, organizziamo{' '}
            <span className="text-amber-400 font-semibold">congressi</span>,{' '}
            <span className="text-amber-400 font-semibold">formazione aziendale</span> ed{' '}
            <span className="text-amber-400 font-semibold">eventi ibridi</span> per PMI a Roma.
            <br />
            <span className="text-slate-400">Dal vivo, online o entrambi.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="#contact-form"
              className="group relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              <span>Richiedi un Preventivo Gratuito</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#services"
              className="group relative bg-white/5 backdrop-blur-xl hover:bg-white/10 border border-white/20 hover:border-amber-500/50 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
            >
              Scopri Come Lavoriamo
            </a>
          </div>

          {/* Bento Grid Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div
                  key={idx}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300"
                >
                  <div className="relative">
                    <Icon className="w-8 h-8 text-amber-400 mb-3" />
                    <div className="text-4xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServerHeroSection
