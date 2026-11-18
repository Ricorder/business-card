export type CardTab = 'card' | 'resume' | 'graphql'

export interface BusinessCardProps {
  /** Только для тестов и глубоких ссылок: какая вкладка открыта при старте. */
  initialTab?: CardTab
}

export const TAB_LABELS: Record<CardTab, string> = {
  card: 'Визитка',
  resume: 'Резюме',
  graphql: 'GraphQL',
}
