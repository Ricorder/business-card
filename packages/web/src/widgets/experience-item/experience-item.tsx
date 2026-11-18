import type { ExperienceItemProps } from './experience-item.types'
import { CATEGORY_LABELS } from '@/shared/lib/labels'
import styles from './experience-item.module.css'

export function ExperienceItem({ experience, revealHint }: ExperienceItemProps) {
  return (
    <article className={styles.item} id={`experience-${experience.slug}`}>
      <div className={styles.meta}>
        <p className={styles.period}>{experience.period}</p>
        {experience.isCurrent ? <p className={styles.current}>в работе</p> : null}
        {experience.location ? <p className={styles.location}>{experience.location}</p> : null}
      </div>

      <div className={styles.body}>
        <h3 className={styles.role}>{experience.role}</h3>
        <p className={styles.company}>
          {experience.company}
          {experience.companyNote ? <span className={styles.note}> · {experience.companyNote}</span> : null}
        </p>
        <p className={styles.summary}>{experience.summary}</p>

        <ul className={styles.achievements}>
          {experience.achievements.map((achievement) => (
            <li className={styles.achievement} key={achievement.id}>
              <span className={styles.category}>{CATEGORY_LABELS[achievement.category]}</span>
              <span className={styles.text}>{achievement.text}</span>
            </li>
          ))}
        </ul>

        {revealHint ? <p className={styles.hint}>{revealHint}</p> : null}
      </div>
    </article>
  )
}
