import { Module } from '@nestjs/common'
import { CardResolver } from './card.resolver.js'
import { CardService } from './card.service.js'

@Module({
  providers: [CardResolver, CardService],
  exports: [CardService],
})
export class CardModule {}
