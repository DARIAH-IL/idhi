import { createContext, useContext } from 'react'
import type { EntityType } from '@/lib/entity'

export interface OnTheFlyEntityCreationRequest {
  entityTypes: EntityType[]
  onCreated: (entityId: string) => void
}

interface OnTheFlyEntityCreationContextValue {
  open: (request: OnTheFlyEntityCreationRequest) => void
}

export const OnTheFlyEntityCreationContext = createContext<
  OnTheFlyEntityCreationContextValue | undefined
>(undefined)

export function useOnTheFlyEntityCreation() {
  return useContext(OnTheFlyEntityCreationContext)
}
