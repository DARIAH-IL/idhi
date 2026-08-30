import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getSearchEntitiesTypedQueryOptions,
  type TypedEntitySearch,
} from '@/api/typedEntitySearch'
import { SuggestibleTagsField } from './SuggestibleTagsField'

interface Props {
  label: React.ReactNode
}

const TAGS_FACET_SEARCH: TypedEntitySearch = {
  facets: ['tags'],
  page: 0,
  pageSize: 1,
}

export function TagsField({ label }: Props) {
  const { data, isLoading } = useQuery(
    getSearchEntitiesTypedQueryOptions(TAGS_FACET_SEARCH),
  )
  const knownTags = useMemo(
    () => (data?.facets.tags ?? []).map((facet) => facet.value),
    [data],
  )

  return (
    <SuggestibleTagsField
      label={label}
      knownValues={knownTags}
      loading={isLoading}
    />
  )
}
