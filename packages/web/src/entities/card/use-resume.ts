'use client'

import { parseResume, RESUME_QUERY, type Resume } from '@card/contracts'
import { useGraphqlQuery } from '@/shared/api/use-graphql-query'
import type { QueryResult } from '@/shared/api/graphql-client.types'

/**
 * Полное резюме: те же таблицы, только без фильтра по featured.
 * Запрос стартует при первом открытии вкладки, а не при заходе на страницу.
 */
export function useResume(enabled: boolean): QueryResult<Resume> {
  return useGraphqlQuery<Resume>({
    query: RESUME_QUERY,
    rootField: 'resume',
    parse: parseResume,
    enabled,
  })
}
