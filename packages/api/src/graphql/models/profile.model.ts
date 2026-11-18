import { Field, Int, ObjectType } from '@nestjs/graphql'
import { ContactKind } from '../enums.js'

@ObjectType('Profile', { description: 'Шапка визитки: кто, чем занимается и откуда.' })
export class ProfileType {
  @Field()
  id!: string

  @Field({ description: 'Уникальный handle для URL и extern-систем.' })
  handle!: string

  @Field()
  displayName!: string

  @Field({ description: 'Позиция, как её видит рынок: Fullstack-разработчик.' })
  title!: string

  @Field({ description: 'Одна строка позиционирования над остальным содержимым.' })
  tagline!: string

  @Field()
  location!: string

  @Field({ description: 'Развёрнутое «о себе» для вкладки «Резюме».' })
  summary!: string

  @Field(() => String, { nullable: true, description: 'IANA-таймзона, чтобы собеседник мог планировать созвон.' })
  timezone?: string | null

  @Field({ description: 'ISO-дата последнего обновления содержимого.' })
  updatedAt!: string
}

@ObjectType('ContactLink', { description: 'Ссылка для связи. Приватные в публичном API не отдаются.' })
export class ContactLinkType {
  @Field()
  id!: string

  @Field(() => ContactKind)
  kind!: ContactKind

  @Field()
  label!: string

  @Field()
  url!: string

  @Field(() => Int)
  position!: number
}

@ObjectType('Metric', { description: 'Одна крупная цифра в шапке витрины.' })
export class MetricType {
  @Field()
  id!: string

  @Field()
  value!: string

  @Field()
  label!: string

  @Field(() => String, { nullable: true, description: 'Откуда цифра: уточнение, снимающее вопрос «а не придумал ли».' })
  detail?: string | null

  @Field(() => Int)
  position!: number
}
