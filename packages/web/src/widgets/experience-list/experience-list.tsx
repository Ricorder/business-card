import { ExperienceItem } from '@/widgets/experience-item/experience-item'
import { Section } from '@/shared/ui/section'
import type { ExperienceListProps } from './experience-list.types'
import styles from './experience-list.module.css'

export function ExperienceList({ experiences, variant }: ExperienceListProps) {
  const hiddenCount = experiences.reduce((sum, experience) => sum + (experience.achievementsTotal - experience.achievements.length), 0)

  return (
    <Section
      title={variant === 'card' ? 'Где работал' : 'Опыт работы целиком'}
      description={
        variant === 'card'
          ? 'Три последних места и по нескольку фактов с каждого. Полные списки — на вкладке «Резюме» или запросом resume.'
          : 'Все буллеты из базы: тот же GraphQL, только без фильтра по featured.'
      }
    >
      <div className={styles.list}>
        {experiences.map((experience) => (
          <ExperienceItem
            key={experience.id}
            experience={experience}
            revealHint={
              variant === 'card' && experience.achievementsTotal > experience.achievements.length
                ? `Показано ${experience.achievements.length} из ${experience.achievementsTotal} — остальные в запросе resume.`
                : undefined
            }
          />
        ))}
      </div>

      {variant === 'card' && hiddenCount > 0 ? (
        <p className={styles.footer}>
          За кадром витрины осталось {hiddenCount} фактов. Они не удалены и не «для галочки»: просто лежат в той же
          таблице и не отдаютcя запросом card.
        </p>
      ) : null}
    </Section>
  )
}
