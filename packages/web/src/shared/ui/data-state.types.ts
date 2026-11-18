import type { QueryError } from '@/shared/api/graphql-client.types'

export interface DataStateProps {
  error?: QueryError | null
  onRetry?: () => void
  /** Текст-заглушка для скелетона: сколько строк рисовать. */
  rows?: number
}
