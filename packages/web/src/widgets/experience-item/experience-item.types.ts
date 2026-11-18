import type { Experience } from '@card/contracts'

export interface ExperienceItemProps {
  experience: Experience
  /**
   * На витрине видно только featured-буллеты: подсказка честно говорит, сколько
   * строк осталось за кадром и как их посмотреть.
   */
  revealHint?: string
}
