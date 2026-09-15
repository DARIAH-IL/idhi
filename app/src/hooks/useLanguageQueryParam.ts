import { useEffect } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'
import { UiLanguage } from '@/api/models'
import { useUIStore } from '@/stores/ui'
import { QUERY_PARAMS } from '@/lib/queryParams'

function isLanguage(value: string): value is UiLanguage {
  return Object.values(UiLanguage).some((lang) => lang === value)
}

export function useLanguageQueryParam() {
  const [language, setLanguageQueryParam] = useQueryParam(
    QUERY_PARAMS.language,
    StringParam,
  )
  const setLanguage = useUIStore((state) => state.setLanguage)

  useEffect(() => {
    if (language == null) {
      setLanguageQueryParam(useUIStore.getState().language, 'replaceIn')
      return
    }

    if (isLanguage(language)) {
      setLanguage(language)
      return
    }
    setLanguageQueryParam(useUIStore.getState().language, 'replaceIn')
  }, [language, setLanguage, setLanguageQueryParam])
}
