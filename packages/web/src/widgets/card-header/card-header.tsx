import type { ContactLink, Profile } from '@card/contracts'
import type { CardHeaderProps } from './card-header.types'
import { CONTACT_LABELS } from '@/shared/lib/labels'
import styles from './card-header.module.css'

/**
 * Шапка визитки: кто, в какой роли, каким словом о себе, где сидит и как до
 * него достучаться. Всё это приходит из GraphQL-запроса `card`, в файле нет
 * ни одной строки текста о человеке.
 */
export function CardHeader({ profile, links }: CardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <p className={styles.kicker}>Цифровая визитка</p>
        <h1 className={styles.name}>{profile.displayName}</h1>
        <p className={styles.title}>{profile.title}</p>
        <p className={styles.tagline}>{profile.tagline}</p>
        <p className={styles.place}>
          {profile.location}
          {profile.timezone ? <span className={styles.muted}> · {profile.timezone}</span> : null}
          <span className={styles.muted}> · обновлено {formatUpdated(profile.updatedAt)}</span>
        </p>
      </div>

      <ul className={styles.links}>
        {links.map((link) => (
          <li key={link.id}>
            {/* mailto не должен открывать новую вкладку — остальные ссылки внешние. */}
            <a
              className={styles.link}
              href={link.url}
              target={link.kind === 'email' ? undefined : '_blank'}
              rel={link.kind === 'email' ? undefined : 'noreferrer noopener'}
              title={CONTACT_LABELS[link.kind]}
            >
              <span className={styles.linkKind}>{CONTACT_LABELS[link.kind]}</span>
              <span className={styles.linkLabel}>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </header>
  )
}

function formatUpdated(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}
