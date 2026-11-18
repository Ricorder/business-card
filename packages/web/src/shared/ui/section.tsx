import type { SectionProps } from './section.types'
import styles from './section.module.css'

export function Section({ title, description, children, id }: SectionProps) {
  return (
    <section className={styles.section} id={id}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  )
}
