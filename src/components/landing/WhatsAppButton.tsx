'use client'

import { MessageCircle } from 'lucide-react'
import React from 'react'

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    window.open(
      'https://wa.me/393401234567?text=Ciao!%20Vorrei%20informazioni%20sui%20vostri%20servizi%20di%20organizzazione%20eventi',
      '_blank'
    )
  }

  return (
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
  )
}

export default WhatsAppButton
