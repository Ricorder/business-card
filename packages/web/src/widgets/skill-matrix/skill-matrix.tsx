import { Section } from '@/shared/ui/section'
import type { SkillMatrixProps } from './skill-matrix.types'
import styles from './skill-matrix.module.css'

export function SkillMatrix({ groups, mode }: SkillMatrixProps) {
  return (
    <Section
      title="Стек"
      description={
        mode === 'card'
          ? 'Сгруппировано по ролям в продукте, а не одним облаком тегов. GraphQL здесь не для списка: этим API визитка и отдаёт своё содержимое.'
          : 'Полный список навыков с той же разбивкой, включая те, что не попали на витрину.'
      }
    >
      <div className={styles.matrix}>
        {groups.map((group) => (
          <section className={styles.group} key={group.id}>
            <h3 className={styles.groupName}>{group.name}</h3>
            <ul className={styles.skills}>
              {group.skills.map((skill) => (
                <li className={skill.featured ? styles.skillFeatured : styles.skill} key={skill.id}>
                  <span className={styles.skillName}>{skill.name}</span>
                  {skill.note ? <span className={styles.skillNote}>{skill.note}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  )
}
