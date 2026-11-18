'use client'

import { useState } from 'react'
import { CARD_QUERY } from '@card/contracts'
import { ThemeToggle } from '@/features/theme-toggle/theme-toggle'
import { useCard } from '@/entities/card/use-card'
import { useResume } from '@/entities/card/use-resume'
import { CardHeader } from '@/widgets/card-header/card-header'
import { ExperienceList } from '@/widgets/experience-list/experience-list'
import { GraphqlView } from '@/widgets/graphql-view/graphql-view'
import { MetricStrip } from '@/widgets/metric-strip/metric-strip'
import { ProfileFacts } from '@/widgets/profile-facts/profile-facts'
import { ProjectsList } from '@/widgets/projects-list/projects-list'
import { SkillMatrix } from '@/widgets/skill-matrix/skill-matrix'
import { DataError, DataLoading } from '@/shared/ui/data-state'
import { Section } from '@/shared/ui/section'
import { TAB_LABELS, type BusinessCardProps, type CardTab } from './business-card.types'
import styles from './business-card.module.css'

const TABS: CardTab[] = ['card', 'resume', 'graphql']

export function BusinessCard({ initialTab = 'card' }: BusinessCardProps) {
  const [tab, setTab] = useState<CardTab>(initialTab)
  const card = useCard()
  const resume = useResume(tab === 'resume')

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.topbar} aria-label="Разделы визитки">
          <p className={styles.mark}>{card.data ? card.data.profile.displayName : 'Визитка'}</p>

          <div className={styles.tabs} role="tablist">
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={tab === name}
                className={tab === name ? styles.tabActive : styles.tab}
                onClick={() => setTab(name)}
              >
                {TAB_LABELS[name]}
              </button>
            ))}
          </div>

          <ThemeToggle />
        </nav>

        <main className={styles.main}>
          {tab === 'card' ? <CardPanel query={card} /> : null}
          {tab === 'resume' ? <ResumePanel query={resume} /> : null}
          {tab === 'graphql' ? <GraphqlPanel card={card} /> : null}
        </main>

        <footer className={styles.footer}>
          <p>
            Страница собрана из статического экспорта Next.js и раздаётся тем же NestJS-процессом, что обслуживает
            GraphQL. Ни одного текста о человеке в компонентах нет — всё приходит запросом{' '}
            <code>card</code> из SQLite через Prisma.
          </p>
          <p className={styles.footerMeta}>
            Сделано с AI-агентом Qwen Code; историю коммитов и план работы см. в{' '}
            <a href={process.env.NEXT_PUBLIC_REPOSITORY_URL ?? 'https://github.com/Ricorder'} target="_blank" rel="noreferrer noopener">
              репозитории
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  )
}

function CardPanel({ query }: { query: ReturnType<typeof useCard> }) {
  if (query.status === 'error' && query.error) {
    return <DataError error={query.error} onRetry={query.reload} />
  }
  if (!query.data) {
    return <DataLoading rows={5} />
  }

  const { profile, metrics, experiences, skillGroups, links, languages } = query.data

  return (
    <>
      <CardHeader profile={profile} links={links} />
      <MetricStrip metrics={metrics} />
      <ExperienceList experiences={experiences} variant="card" />
      <SkillMatrix groups={skillGroups} mode="card" />
      <ProfileFacts languages={languages} />
    </>
  )
}

function ResumePanel({ query }: { query: ReturnType<typeof useResume> }) {
  if (query.status === 'error' && query.error) {
    return <DataError error={query.error} onRetry={query.reload} />
  }
  if (!query.data) {
    return <DataLoading rows={7} />
  }

  const { profile, experiences, projects, skillGroups, languages, education, links } = query.data

  return (
    <>
      <Section title="О себе" description={profile.title} id="about">
        <p className={styles.summary}>{profile.summary}</p>
        <ul className={styles.resumeLinks}>
          {links.map((link) => (
            <li key={link.id}>
              <a href={link.url} target={link.kind === 'email' ? undefined : '_blank'} rel="noreferrer noopener">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
      <ExperienceList experiences={experiences} variant="resume" />
      <ProjectsList projects={projects} />
      <SkillMatrix groups={skillGroups} mode="resume" />
      <ProfileFacts languages={languages} education={education} />
    </>
  )
}

function GraphqlPanel({ card }: { card: ReturnType<typeof useCard> }) {
  // Данные не перезапрашиваем: вкладка показывает ровно тот ответ card, которым
  // уже отрисована визитка, иначе «контракт» расходился бы с экраном.
  if (!card.data) {
    return card.error ? <DataError error={card.error} onRetry={card.reload} /> : <DataLoading rows={6} />
  }

  return <GraphqlView cardQuery={CARD_QUERY} cardData={card.data} />
}
