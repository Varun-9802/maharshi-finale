'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type DraftImage = { url: string; name: string; file: File }
export type DraftMessage = { from: 'bot' | 'user'; text: string }
export type DraftObservation = {
  crop: string
  cropAge: string
  symptoms: string
  images: DraftImage[]
  messages: DraftMessage[]
  parentObservationId?: string | null
}

type ObservationContextValue = {
  draft: DraftObservation | null
  setDraft: (draft: DraftObservation | null) => void
}

const ObservationContext = createContext<ObservationContextValue | null>(null)

export function ObservationProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<DraftObservation | null>(null)
  return <ObservationContext.Provider value={{ draft, setDraft }}>{children}</ObservationContext.Provider>
}

export function useObservation() {
  const context = useContext(ObservationContext)
  if (!context) throw new Error('useObservation must be used within ObservationProvider')
  return context
}
