"use client";

import React from 'react';
import { ArrowRight, Sparkles, Award, MapPin, Target } from 'lucide-react';

interface HeroSectionProps {
  onContactClick: () => void;
  onServicesClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onContactClick, onServicesClick }) => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJzLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyIDUuMzczLTEyIDEyLTEyem0wIDN2MThuYTkgOSAwIDAgMCAwIDAtMTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 transition-all duration-1000 opacity-100 translate-y-0">
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
              onClick={onContactClick}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40"
            >
              Richiedi un Preventivo Gratuito
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onServicesClick}
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
  );
};

export default HeroSection;