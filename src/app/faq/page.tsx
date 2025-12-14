import { HelpCircle } from 'lucide-react'

import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'

export default function FAQPage() {
  const faqs: { q: string; a: string }[] = [
    // ...
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-slate-900 py-20 px-4 sm:px-6 lg:px-8 text-center relative">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Domande <span className="text-amber-500">Frequenti</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-300">
          Risposte alle domande più comuni sui nostri servizi e metodologie.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <HelpCircle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
