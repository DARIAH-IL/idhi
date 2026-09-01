import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AuditedEntity } from '@/api/models'
import type { EntityType } from '@/lib/entity'
import { searchEntitiesTyped } from '@/api/typedEntitySearch'
import type { EntityField } from '@/api/typedEntitySearch'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EntityReferenceCard } from '@/components/entity/EntityReferenceCard'

interface DuplicateCheckContextValue {
  check: (field: EntityField, value: string | null | undefined) => void
}

const DuplicateCheckContext = createContext<
  DuplicateCheckContextValue | undefined
>(undefined)

export function useDuplicateCheck() {
  return useContext(DuplicateCheckContext)
}

interface ProviderProps {
  entityType: EntityType
  enabled: boolean
  children: React.ReactNode
}

export function DuplicateCheckProvider({
  entityType,
  enabled,
  children,
}: ProviderProps) {
  const { t } = useTranslation()
  const [suspects, setSuspects] = useState<AuditedEntity[]>([])
  const [keyword, setKeyword] = useState('')
  const seenRef = useRef<Set<string>>(new Set())

  const check = useCallback(
    (field: EntityField, rawValue: string | null | undefined) => {
      if (!enabled) {
        return
      }
      const value = (rawValue ?? '').trim()
      if (value.length < 2) {
        return
      }
      const key = `${field}:${value.toLowerCase()}`
      if (seenRef.current.has(key)) {
        return
      }
      seenRef.current.add(key)

      searchEntitiesTyped({
        filter: {
          and: [
            { field: 'type', op: 'eq', value: entityType },
            { field, op: 'eq', value },
          ],
        },
        page: 0,
        pageSize: 5,
      })
        .then((result) => {
          if (result.results.length > 0) {
            setSuspects(result.results)
            setKeyword(value)
          }
        })
        .catch(() => {})
    },
    [enabled, entityType],
  )

  return (
    <DuplicateCheckContext.Provider value={{ check }}>
      {children}
      <Dialog
        isOpen={suspects.length > 0}
        onOpenChange={(open) => {
          if (!open) {
            setSuspects([])
          }
        }}
        className="sm:max-w-4xl"
      >
        <DialogHeader>
          <DialogTitle>{t('entity.duplicate_check.title')}</DialogTitle>
          <DialogDescription>
            {t('entity.duplicate_check.description', { keyword })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-80 flex-col gap-2 p-2 overflow-y-auto">
          {suspects.map((suspect) => (
            <EntityReferenceCard
              key={suspect.id}
              entityId={suspect.id}
              entity={suspect}
            />
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onPress={() => setSuspects([])}>
            {t('entity.duplicate_check.dismiss')}
          </Button>
        </DialogFooter>
      </Dialog>
    </DuplicateCheckContext.Provider>
  )
}
