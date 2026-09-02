import type { QueryFilter } from 'mongoose'
import type { Filter, FilterOperator, FilterableField } from '../../models'

export type MongoFieldMapper = (field: FilterableField) => string

const MONGO_OPERATORS: Record<FilterOperator, string> = {
  eq: '$eq',
  ne: '$ne',
  gt: '$gt',
  gte: '$gte',
  lt: '$lt',
  lte: '$lte',
  in: '$in',
  nin: '$nin',
  exists: '$exists',
}

export const CASE_INSENSITIVE_COLLATION = { locale: 'en', strength: 2 }

function comparisonFilter(
  field: FilterableField,
  operator: FilterOperator,
  value: unknown,
  mapField: MongoFieldMapper,
): QueryFilter<Record<string, unknown>> {
  const mongoField = mapField(field)

  if (operator === 'in' || operator === 'nin') {
    const values = Array.isArray(value) ? value : [value]
    return { [mongoField]: { [MONGO_OPERATORS[operator]]: values } }
  }

  const mongoValue = operator === 'exists' ? Boolean(value) : value

  return {
    [mongoField]: { [MONGO_OPERATORS[operator]]: mongoValue },
  }
}

export function toMongoFilter(
  filter: Filter,
  mapField: MongoFieldMapper,
): QueryFilter<Record<string, unknown>> {
  if ('and' in filter) {
    return {
      $and: filter.and.map((nestedFilter) =>
        toMongoFilter(nestedFilter, mapField),
      ),
    }
  }

  if ('or' in filter) {
    return {
      $or: filter.or.map((nestedFilter) =>
        toMongoFilter(nestedFilter, mapField),
      ),
    }
  }

  return comparisonFilter(filter.field, filter.op, filter.value, mapField)
}
