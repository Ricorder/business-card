import type { Education, Language } from '@card/contracts'

export interface ProfileFactsProps {
  languages: Language[]
  education?: Education[]
}
