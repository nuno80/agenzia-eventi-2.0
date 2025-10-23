import React, { useState, useEffect } from 'react';
import { Calendar, Users, Video, GraduationCap, ArrowRight, Sparkles, Award, MapPin, Target, ChevronDown } from 'lucide-react';

const ModernHeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const floatingIcons = [
    { Icon: Calendar, delay: '0s', duration: '20s' },
    { Icon: Users, delay: '2s', duration: '18s' },
    { Icon: Video, delay: '4s', duration: '22s' },
    { Icon: GraduationCap, delay: '6s', duration: '19s' },
  ];

  const stats = [
    { number: '15+', label: 'Anni Esperienza', icon: Award },
    { number: '200+', label: 'Eventi Gestiti', icon: Calendar },
    { number: '5.000+', label: 'Partecipanti', icon: Users },
  ];

  const trustSignals = [
    { icon: Award, text: 'Esperienza Eventi ECM' },
    { icon: MapPin, text: 'Base a Roma' },
    { icon: Target, text: 'Focus PMI & Corporate' },
  ];

  // Generate random particles/stars
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
    opacity: Math.random() * 0.5 + 0.3,
  }));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Floating Particles/Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-amber-400"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
              animation: `twinkle ${particle.duration}s ease-in-out ${particle.delay}s infinite, float-particle ${particle.duration * 3}s ease-in-out ${particle.delay}s infinite`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(251, 191, 36, ${particle.opacity})`,
            }}
          />
        ))}
      </div>
      {/* Animated Gradient Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, 
                rgba(217, 119, 6, 0.3) 0%, 
                transparent 50%),
              radial-gradient(circle at ${30 - mousePosition.x}% ${70 - mousePosition.y}%, 
                rgba(245, 158, 11, 0.2) 0%, 
                transparent 50%),
              linear-gradient(135deg, 
                #0f172a 0%, 
                #1e293b 50%, 
                #0f172a 100%)
            `,
            transition: 'background 0.3s ease',
          }}
        />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse-slower" />
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating Icons */}
      {floatingIcons.map(({ Icon, delay, duration }, idx) => (
        <div
          key={idx}
          className="absolute text-amber-500/10"
          style={{
            top: `${20 + idx * 20}%`,
            left: `${10 + idx * 20}%`,
            animation: `float ${duration} ease-in-out ${delay} infinite`,
          }}
        >
          <Icon className="w-16 h-16" />
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Eyebrow */}
          <div 
            className={`inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 mb-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-amber-300">
              Specialisti in Eventi Corporate a Roma
            </span>
          </div>

          {/* Main Headline */}
          <h1 
            className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span className="text-white">Eventi Corporate che</span>
            <br />
            <span className="inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 animate-gradient">
                Generano Risultati Concreti
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`text-xl sm:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Con la precisione degli eventi medici ECM, organizziamo{' '}
            <span className="text-amber-400 font-semibold">congressi</span>,{' '}
            <span className="text-amber-400 font-semibold">formazione aziendale</span> ed{' '}
            <span className="text-amber-400 font-semibold">eventi ibridi</span> per PMI a Roma.
            <br />
            <span className="text-slate-400">Dal vivo, online o entrambi.</span>
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <button 
              className="group relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
            >
              <span>Richiedi un Preventivo Gratuito</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              className="group relative bg-white/5 backdrop-blur-xl hover:bg-white/10 border border-white/20 hover:border-amber-500/50 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Scopri Come Lavoriamo
            </button>
          </div>

          {/* Bento Grid Stats */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12 transition-all duration-1000 delay-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative">
                    <Icon className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-4xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                      {stat.number}
                    </div>
                    <div className="text-sm text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Bar */}
          <div 
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-4xl mx-auto transition-all duration-1000 delay-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trustSignals.map((signal, idx) => {
                const Icon = signal.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-center gap-3 group"
                  >
                    <Icon className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-slate-200 font-medium">
                      {signal.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-slate-400 animate-bounce-slow">
          <span className="text-sm">Scopri di più</span>
          <ChevronDown className="w-6 h-6" />
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }

        @keyframes pulse-slower {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.2;
            transform: scale(1.15);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-30px) translateX(10px);
          }
          50% {
            transform: translateY(-15px) translateX(-10px);
          }
          75% {
            transform: translateY(-40px) translateX(5px);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 10s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default ModernHeroSection;