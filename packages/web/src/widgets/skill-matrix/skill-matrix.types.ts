import type { SkillGroup } from '@card/contracts'

export interface SkillMatrixProps {
  groups: SkillGroup[]
  /** В резюме показываем и неподписанные заметно навыки, на витрине — только featured. */
  mode: 'card' | 'resume'
}
