import { ERROR_HINTS } from '@/shared/lib/labels'
import type { DataStateProps } from './data-state.types'
import styles from './data-state.module.css'

export function DataLoading({ rows = 4 }: DataStateProps) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <p className={styles.loadingCaption}>Запрашиваю содержимое визитки через GraphQL…</p>
      <ul className={styles.skeleton}>
        {Array.from({ length: rows }, (_, index) => (
          <li className={styles.skeletonRow} key={index} style={{ width: `${92 - index * 11}%` }} />
        ))}
      </ul>
    </div>
  )
}

export function DataError({ error, onRetry }: DataStateProps) {
  if (!error) {
    return null
  }

  return (
    <div className={styles.error}>
      <p className={styles.errorTitle}>Не удалось получить содержимое ({error.kind})</p>
      <p className={styles.errorMessage}>{error.message}</p>
      {ERROR_HINTS[error.kind] ? <p className={styles.errorHint}>{ERROR_HINTS[error.kind]}</p> : null}
      {onRetry ? (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Повторить запрос
        </button>
      ) : null}
    </div>
  )
}
