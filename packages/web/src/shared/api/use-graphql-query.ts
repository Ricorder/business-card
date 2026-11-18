'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { runGraphqlQuery } from './graphql-client'
import type { QueryError, QueryResult } from './graphql-client.types'

interface UseGraphqlQueryArgs<T> {
  query: string
  rootField: string
  parse: (data: unknown) => T
  variables?: Record<string, unknown>
  /**
   * false — не стрелять запросом при монтировании. Нужно для вкладки «Резюме»:
   * без этого флага каждое открытие страницы делало бы два GraphQL-запроса,
   * хотя второй в большинстве случаев не смотрят.
   */
  enabled?: boolean
}

/**
 * Один запрос на экран, без кэширующего клиента: данных на визитке десятки
 * строк, и лишняя библиотека ради них была бы оверинжинирингом.
 *
 * AbortController нужен не для красоты: в StrictMode эффект в дев-режиме
 * отрабатывает дважды, и без отмены второй ответ перезаписал бы первый.
 */
export function useGraphqlQuery<T>(args: UseGraphqlQueryArgs<T>): QueryResult<T> {
  const { query, rootField, parse, enabled = true } = args
  const variablesKey = useMemo(() => JSON.stringify(args.variables ?? {}), [args.variables])
  const variablesRef = useRef(args.variables)
  variablesRef.current = args.variables

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<QueryError | null>(null)
  const [loading, setLoading] = useState(enabled)
  const controllerRef = useRef<AbortController | null>(null)

  const load = useCallback(() => {
    if (!enabled) {
      return
    }

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setError(null)

    runGraphqlQuery<T>({
      query,
      rootField,
      parse,
      variables: variablesRef.current,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) {
          return
        }
        setData(result)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        const kind = (cause as { kind?: QueryError['kind'] }).kind ?? 'network'
        const message = cause instanceof Error ? cause.message : String(cause)
        setError({ kind, message })
        setLoading(false)
      })
  }, [enabled, query, rootField, parse, variablesKey])

  useEffect(() => {
    load()
    return () => controllerRef.current?.abort()
  }, [load])

  return {
    status: loading ? 'loading' : error ? 'error' : data ? 'ready' : 'idle',
    data,
    error,
    reload: load,
  }
}
