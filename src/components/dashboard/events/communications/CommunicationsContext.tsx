'use client'

import { createContext, useContext, useState } from 'react'

export type Draft = {
  subject: string
  body: string
  recipientType: string
  templateId?: string | null
}

type CommunicationsContextType = {
  draft: Draft | null
  setDraft: (draft: Draft) => void
}

const CommunicationsContext = createContext<CommunicationsContextType | undefined>(undefined)

export function CommunicationsProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<Draft | null>(null)

  return (
    <CommunicationsContext.Provider value={{ draft, setDraft }}>
      {children}
    </CommunicationsContext.Provider>
  )
}

export function useCommunications() {
  const context = useContext(CommunicationsContext)
  if (!context) throw new Error('useCommunications must be used within CommunicationsProvider')
  return context
}
