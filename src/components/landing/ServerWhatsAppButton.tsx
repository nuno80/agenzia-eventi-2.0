// src/components/landing/ServerWhatsAppButton.tsx
// Server Component version of WhatsAppButton - static version without interactivity

import { MessageCircle } from 'lucide-react'
import React from 'react'

const ServerWhatsAppButton = () => {
  return (
    <div className="fixed bottom-6 right-6 bg-green-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50">
      <MessageCircle className="w-7 h-7" />
    </div>
  )
}

export default ServerWhatsAppButton
