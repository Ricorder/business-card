export type QueryStatus = 'idle' | 'loading' | 'ready' | 'error'

export type QueryErrorKind = 'network' | 'http' | 'graphql' | 'contract'

export interface QueryError {
  kind: QueryErrorKind
  message: string
}

export interface QueryResult<T> {
  status: QueryStatus
  data: T | null
  error: QueryError | null
  reload: () => void
}

export interface GraphqlTransportArgs<T> {
  query: string
  /** Корневое поле ответа: `{ card: … }` против `{ resume: … }`. */
  rootField: string
  variables?: Record<string, unknown>
  /** Валидация ответа на границе: без неё тип в редакторе ничего не гарантирует. */
  parse: (data: unknown) => T
  signal?: AbortSignal
  endpoint?: string
}

export interface GraphqlTransportError extends Error {
  kind: QueryErrorKind
  status?: number
}
