import { LANGUAGE_LEVEL_LABELS } from '@/shared/lib/labels'
import { Section } from '@/shared/ui/section'
import type { ProfileFactsProps } from './profile-facts.types'
import styles from './profile-facts.module.css'

export function ProfileFacts({ languages, education }: ProfileFactsProps) {
  return (
    <Section title="Языки и образование" description="Не для списка: уровень языка важен на созвонах с зарубежной командой.">
      <div className={styles.grid}>
        <dl className={styles.languages}>
          {languages.map((language) => (
            <div className={styles.language} key={language.id}>
              <dt className={styles.languageName}>{language.name}</dt>
              <dd className={styles.languageLevel}>{LANGUAGE_LEVEL_LABELS[language.level]}</dd>
            </div>
          ))}
        </dl>

        {education?.length ? (
          <ul className={styles.education}>
            {education.map((entry) => (
              <li className={styles.educationItem} key={entry.id}>
                <p className={styles.school}>{entry.school}</p>
                <p className={styles.degree}>
                  {entry.degree} · {entry.year}
                </p>
                {entry.note ? <p className={styles.note}>{entry.note}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Section>
  )
}
