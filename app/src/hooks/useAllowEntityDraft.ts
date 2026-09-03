import { createContext, useContext } from 'react'

export const AllowEntityDraftContext = createContext(true)

export function useAllowEntityDraft() {
  return useContext(AllowEntityDraftContext)
}
