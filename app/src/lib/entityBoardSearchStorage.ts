import { redirect } from '@tanstack/react-router'
import { entityBoardSearchSchema } from '#/api/entityBoardSearch.ts'
import type { EntityBoardSearch } from '#/api/entityBoardSearch.ts'

const STORED_SEARCH_KEY = 'entityBoardSearch'
const SKIP_RESTORE_KEY = 'entityBoardSkipRestoreOnce'

export function skipEntityBoardSearchRestoreOnce() {
  sessionStorage.setItem(SKIP_RESTORE_KEY, 'true')
}

function isEmptySearch(search: EntityBoardSearch) {
  return (
    !search.q && !search.facetFilters && !search.sort && !search.advancedFilter
  )
}

function readStoredSearch(): EntityBoardSearch | undefined {
  const raw = sessionStorage.getItem(STORED_SEARCH_KEY)
  if (!raw) {
    return undefined
  }
  try {
    const parsed = entityBoardSearchSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : undefined
  } catch {
    return undefined
  }
}

export function restoreOrPersistEntityBoardSearch({
  search,
  cause,
}: {
  search: EntityBoardSearch
  cause: 'preload' | 'enter' | 'stay'
}) {
  if (cause === 'preload') {
    return
  }
  const shouldSkipRestore = sessionStorage.getItem(SKIP_RESTORE_KEY) === 'true'
  if (shouldSkipRestore) {
    sessionStorage.removeItem(SKIP_RESTORE_KEY)
    sessionStorage.setItem(STORED_SEARCH_KEY, JSON.stringify(search))
    return
  }
  if (cause === 'enter' && isEmptySearch(search)) {
    const stored = readStoredSearch()
    if (stored && !isEmptySearch(stored)) {
      throw redirect({ to: '/entities', search: stored, replace: true })
    }
    return
  }
  sessionStorage.setItem(STORED_SEARCH_KEY, JSON.stringify(search))
}
