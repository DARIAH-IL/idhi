import { redirect } from '@tanstack/react-router'
import { entityBoardSearchSchema } from '#/api/entityBoardSearch.ts'
import type { EntityBoardSearch } from '#/api/entityBoardSearch.ts'

const STORED_SEARCH_KEY = 'entityBoardSearch'

function isEmptySearch(search: EntityBoardSearch) {
  return !search.q && !search.facetFilters && !search.sort
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
  if (cause === 'enter' && isEmptySearch(search)) {
    const stored = readStoredSearch()
    if (stored && !isEmptySearch(stored)) {
      throw redirect({ to: '/entities', search: stored, replace: true })
    }
    return
  }
  sessionStorage.setItem(STORED_SEARCH_KEY, JSON.stringify(search))
}
