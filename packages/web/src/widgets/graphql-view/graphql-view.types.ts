import type { Card } from '@card/contracts'

export interface GraphqlViewProps {
  /** Текст запроса, которым страница реально получила свои данные. */
  cardQuery: string
  /** Тот же ответ, что лежит в состоянии вьюхи: показываем его как есть. */
  cardData: Card
  endpoint?: string
}
