import { describeParseError } from '@card/contracts'
import type { GraphqlTransportArgs, GraphqlTransportError } from './graphql-client.types'

/**
 * В проде визитка и API живут на одном origin (NestJS раздаёт статический
 * экспорт и GraphQL с одного порта), поэтому относительный путь — не заглушка,
 * а ровно тот адрес, что видит браузер. Переопределение нужно только когда
 * фронт поднимают отдельно от API.
 */
export const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? '/graphql'

interface RawGraphqlResponse {
  data?: Record<string, unknown> | null
  errors?: Array<{ message?: string }>
}

export function graphqlTransportError(kind: GraphqlTransportError['kind'], message: string, status?: number): GraphqlTransportError {
  const error = new Error(message) as GraphqlTransportError
  error.kind = kind
  if (status !== undefined) {
    error.status = status
  }
  return error
}

export async function runGraphqlQuery<T>(args: GraphqlTransportArgs<T>): Promise<T> {
  const endpoint = args.endpoint ?? GRAPHQL_ENDPOINT

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ query: args.query, variables: args.variables ?? {} }),
      signal: args.signal,
      cache: 'no-store',
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw graphqlTransportError('network', 'Запрос отменён')
    }
    throw graphqlTransportError('network', `GraphQL недоступен по адресу ${endpoint}`)
  }

  if (!response.ok) {
    throw graphqlTransportError('http', `GraphQL ответил ${response.status} ${response.statusText}`, response.status)
  }

  let payload: RawGraphqlResponse
  try {
    payload = (await response.json()) as RawGraphqlResponse
  } catch {
    throw graphqlTransportError('graphql', 'Ответ GraphQL не является JSON')
  }

  if (payload.errors?.length) {
    throw graphqlTransportError(
      'graphql',
      payload.errors.map((error) => error.message ?? 'ошибка без сообщения').join('; '),
    )
  }

  const root = payload.data?.[args.rootField]
  if (root === undefined || root === null) {
    throw graphqlTransportError('contract', `В ответе нет поля ${args.rootField}`)
  }

  try {
    return args.parse(root)
  } catch (error) {
    throw graphqlTransportError('contract', `Ответ не совпал с контрактом — ${describeParseError(error)}`)
  }
}
