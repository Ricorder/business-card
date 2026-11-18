import type { Experience } from '@card/contracts'

export interface ExperienceListProps {
  experiences: Experience[]
  /** 'card' — витрина с featured-буллетами, 'resume' — все буллеты из базы. */
  variant: 'card' | 'resume'
}
