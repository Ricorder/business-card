'use client'

import { useState } from 'react'
import { parseSearchResult, SEARCH_QUERY, type SearchResult } from '@card/contracts'
import { GRAPHQL_ENDPOINT, runGraphqlQuery } from '@/shared/api/graphql-client'
import { Section } from '@/shared/ui/section'
import styles from './graphql-view.module.css'
import type { GraphqlViewProps } from './graphql-view.types'

interface SearchState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  result: SearchResult | null
  error: string | null
  payload: string
}

const IDLE: SearchState = { status: 'idle', result: null, error: null, payload: '' }

/**
 * Вкладка не «про GraphQL», а сам GraphQL: слева текст запроса, которым
 * отрисована визитка, справа его ответ, внизу — форма, выполняющая search() с
 * переменными. Так ревьюер видит контракт без GraphiQL и может потрогать его
 * прямо на странице.
 */
export function GraphqlView({ cardQuery, cardData, endpoint = GRAPHQL_ENDPOINT }: GraphqlViewProps) {
  const [term, setTerm] = useState('GraphQL')
  const [search, setSearch] = useState<SearchState>(IDLE)

  async function runSearch(event: React.FormEvent) {
    event.preventDefault()
    const variables = { query: term, limit: 8 }
    const payload = JSON.stringify({ query: SEARCH_QUERY, variables }, null, 2)

    setSearch({ ...IDLE, status: 'loading', payload })
    try {
      const result = await runGraphqlQuery<SearchResult>({
        query: SEARCH_QUERY,
        rootField: 'search',
        variables,
        parse: parseSearchResult,
        endpoint,
      })
      setSearch({ status: 'ready', result, error: null, payload })
    } catch (cause) {
      setSearch({
        status: 'error',
        result: null,
        error: cause instanceof Error ? cause.message : String(cause),
        payload,
      })
    }
  }

  return (
    <Section
      title="GraphQL-контракт"
      description={`Страница не содержит текста о человеке: она рисует ответ запроса card на ${endpoint}. Ниже — тот же endpoint с аргументами.`}
      id="graphql"
    >
      <div className={styles.grid}>
        <figure className={styles.block}>
          <figcaption className={styles.caption}>Запрос, которым загружена визитка</figcaption>
          <pre className={styles.code}>
            <code>{cardQuery}</code>
          </pre>
        </figure>

        <figure className={styles.block}>
          <figcaption className={styles.caption}>Первые 2000 символов ответа</figcaption>
          <pre className={styles.code}>
            <code>{truncate(JSON.stringify({ data: { card: cardData } }, null, 2), 2000)}</code>
          </pre>
        </figure>
      </div>

      <form className={styles.form} onSubmit={runSearch}>
        <label className={styles.label} htmlFor="graphql-search">
          Живой запрос search(query: String!, limit: Int)
        </label>
        <div className={styles.row}>
          <input
            id="graphql-search"
            className={styles.input}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="например: идемпотентность"
          />
          <button className={styles.submit} type="submit" disabled={search.status === 'loading'}>
            {search.status === 'loading' ? 'Выполняется…' : 'Выполнить'}
          </button>
          <a className={styles.console} href="/graphql" target="_blank" rel="noreferrer noopener">
            Открыть GraphiQL
          </a>
        </div>
      </form>

      {search.payload ? (
        <figure className={styles.block}>
          <figcaption className={styles.caption}>Тело POST-запроса</figcaption>
          <pre className={styles.code}>
            <code>{truncate(search.payload, 1200)}</code>
          </pre>
        </figure>
      ) : null}

      {search.status === 'error' && search.error ? <p className={styles.error}>{search.error}</p> : null}

      {search.status === 'ready' && search.result ? (
        <div className={styles.hits}>
          <p className={styles.hitsCaption}>
            {search.result.total} совпадений по «{search.result.query}»
          </p>
          {search.result.hits.length === 0 ? <p className={styles.empty}>Ничего не нашлось.</p> : null}
          <ul className={styles.hitList}>
            {search.result.hits.map((hit) => (
              <li className={styles.hit} key={hit.id}>
                <span className={styles.hitKind}>{hit.kind}</span>
                <span className={styles.hitTitle}>{hit.title}</span>
                <span className={styles.hitText}>{hit.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  )
}

function truncate(text: string, limit: number): string {
  return text.length <= limit ? text : `${text.slice(0, limit)}\n… обрезано для читаемости`
}
