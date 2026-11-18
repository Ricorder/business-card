import { Query, Resolver } from '@nestjs/graphql'
import type { Card, Resume } from '@card/contracts'
import { CardService } from './card.service.js'
import { CardType, ResumeType } from '../graphql/models/card.model.js'

@Resolver(() => CardType)
export class CardResolver {
  constructor(private readonly cards: CardService) {}

  @Query(() => CardType, {
    name: 'card',
    description: 'Витрина визитки — отобранный срез, который читается за 40 секунд.',
  })
  card(): Promise<Card> {
    return this.cards.getCard()
  }

  @Query(() => ResumeType, {
    name: 'resume',
    description: 'Полное резюме: все буллеты, проекты и образование из той же базы.',
  })
  resume(): Promise<Resume> {
    return this.cards.getResume()
  }
}
