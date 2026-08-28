import type { SortCriterion } from '../../models'
import type { MongoFieldMapper } from './filter'

export function toMongoSortFields(
  sort: SortCriterion[],
  mapField: MongoFieldMapper,
): Map<string, 1 | -1> {
  const fields = new Map<string, 1 | -1>()
  for (const criterion of sort) {
    fields.set(
      mapField(criterion.property),
      criterion.direction === 'asc' ? 1 : -1,
    )
  }
  return fields
}
