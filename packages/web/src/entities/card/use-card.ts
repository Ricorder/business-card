'use client'

import { CARD_QUERY, type Card, parseCard } from '@card/contracts'
import { useGraphqlQuery } from '@/shared/api/use-graphql-query'
import type { QueryResult } from '@/shared/api/graphql-client.types'

/** Витрина: отобранный срез. Ответ проверяется схемой из @card/contracts. */
export function useCard(): QueryResult<Card> {
  return useGraphqlQuery<Card>({
    query: CARD_QUERY,
    rootField: 'card',
    parse: parseCard,
  })
}
