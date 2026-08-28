import type {
  Filter as EntityFilter,
  FilterableField,
  SortCriterion,
} from '../../models'
import { toMongoFilter } from './filter'
import { SEARCH_SCORE_FIELD } from './search'
import { toMongoSortFields } from './sort'

export function storedEntityField(field: FilterableField): string {
  return field === 'id' ? '_id' : field
}

export function toMongoEntityFilter(filter: EntityFilter) {
  return toMongoFilter(filter, storedEntityField)
}

export function toMongoEntitySort(
  sort: SortCriterion[] | undefined,
  includeSearchScore: boolean,
): Record<string, 1 | -1> {
  if (!sort?.length) {
    return {
      ...(includeSearchScore ? { [SEARCH_SCORE_FIELD]: -1 } : {}),
      'audit.modifiedAt': -1,
    }
  }

  const fields = toMongoSortFields(sort, storedEntityField)
  if (includeSearchScore) {
    fields.delete(SEARCH_SCORE_FIELD)
    fields.set(SEARCH_SCORE_FIELD, -1)
  }

  return Object.fromEntries(fields)
}
