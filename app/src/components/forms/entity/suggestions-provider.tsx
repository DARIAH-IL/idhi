import { createContext, useCallback, useContext } from 'react'
import type { AnyFormApi } from '@tanstack/react-form'
import type { Entity } from '@/api/models'
import { cleanValue } from '@/lib/clean-value'
import { toSuggestionEntity } from '@/lib/suggestion-payload'

interface EntitySuggestionContextValue {
  getEntity: () => Entity
}

const EntitySuggestionContext = createContext<
  EntitySuggestionContextValue | undefined
>(undefined)

export function useEntitySuggestionSource() {
  return useContext(EntitySuggestionContext)
}

interface ProviderProps {
  form: AnyFormApi
  children: React.ReactNode
}

export function EntitySuggestionProvider({ form, children }: ProviderProps) {
  const getEntity = useCallback((): Entity => {
    const values: Entity = form.state.values

    return toSuggestionEntity(cleanValue(values))
  }, [form])

  return (
    <EntitySuggestionContext.Provider value={{ getEntity }}>
      {children}
    </EntitySuggestionContext.Provider>
  )
}
