'use client'

const stats = [
  { number: '15+', label: 'Anni Esperienza', sublabel: 'in event management' },
  { number: '200+', label: 'Eventi Gestiti', sublabel: 'inclusi ECM nazionali' },
  { number: '5.000+', label: 'Partecipanti', sublabel: 'coinvolti in eventi complessi' },
  { number: '100%', label: 'Dedicato', sublabel: 'a PMI e corporate' },
]

const StatsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
                {stat.number}
              </div>
              <div className="text-xl font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-slate-400">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
