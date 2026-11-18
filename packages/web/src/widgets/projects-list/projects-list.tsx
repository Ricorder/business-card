import { Section } from '@/shared/ui/section'
import type { ProjectsListProps } from './projects-list.types'
import styles from './projects-list.module.css'

export function ProjectsList({ projects }: ProjectsListProps) {
  return (
    <Section
      title="Продукты"
      description="Не вакансии, а то, что осталось работать после меня. Стек у каждого проекта лежит отдельной таблицей — StackItem, а не строкой через запятую."
    >
      <ul className={styles.list}>
        {projects.map((project) => (
          <li className={styles.project} key={project.id}>
            <div className={styles.head}>
              <h3 className={styles.name}>{project.name}</h3>
              {project.year ? <p className={styles.year}>{project.year}</p> : null}
            </div>
            <p className={styles.summary}>{project.summary}</p>
            <ul className={styles.stack}>
              {project.stack.map((technology) => (
                <li className={styles.chip} key={`${project.slug}-${technology}`}>
                  {technology}
                </li>
              ))}
            </ul>
            {project.url ? (
              <a className={styles.link} href={project.url} target="_blank" rel="noreferrer noopener">
                Открыть
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  )
}
