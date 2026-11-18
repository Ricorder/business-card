import {
  type Card,
  type Health,
  type Resume,
  type SearchResult,
  cardSchema,
  healthSchema,
  resumeSchema,
  searchResultSchema,
} from './schema.js'

/**
 * zod живёт только здесь: пакета-клиента с типами достаточно, чтобы и API, и
 * браузер сверяли ответ со схемой. В @card/web не приходится объявлять zod и
 * тянуть его из-под другого пакета — pnpm этого всё равно бы не разрешил.
 */
export function parseCard(data: unknown): Card {
  return cardSchema.parse(data)
}

export function parseResume(data: unknown): Resume {
  return resumeSchema.parse(data)
}

export function parseSearchResult(data: unknown): SearchResult {
  return searchResultSchema.parse(data)
}

export function parseHealth(data: unknown): Health {
  return healthSchema.parse(data)
}

/** Сообщение об ошибке валидации, пригодное для console.error в браузере. */
export function describeParseError(error: unknown): string {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: unknown }).issues
    if (Array.isArray(issues)) {
      return issues
        .map((issue) => {
          const path = (issue as { path?: unknown[] }).path
          const message = (issue as { message?: string }).message
          return `${(path ?? []).join('.') || '(root)'}: ${message ?? 'неизвестная ошибка'}`
        })
        .join('; ')
    }
  }
  return error instanceof Error ? error.message : String(error)
}
