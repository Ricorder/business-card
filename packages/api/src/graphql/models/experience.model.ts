import { Field, Int, ObjectType } from '@nestjs/graphql'
import { AchievementCategory } from '../enums.js'

@ObjectType('Achievement', { description: 'Один факт из опыта: формулировка + категория.' })
export class AchievementType {
  @Field()
  id!: string

  @Field()
  text!: string

  @Field(() => AchievementCategory)
  category!: AchievementCategory

  @Field(() => Int)
  position!: number
}

@ObjectType('Experience', {
  description:
    'Место работы. В `card` возвращаются только featured-буллеты (витрина читается за 40 секунд), ' +
    'в `resume` — все, при этом achievementsTotal остаётся честным числом всех записей.',
})
export class ExperienceType {
  @Field()
  id!: string

  @Field({ description: 'slug для глубоких ссылок вида /#experience-<slug>.' })
  slug!: string

  @Field()
  company!: string

  @Field(() => String, { nullable: true, description: 'Например «NDA» или отраслевая строка, если бренд нельзя назвать.' })
  companyNote?: string | null

  @Field()
  role!: string

  @Field({ description: 'Читимый период: «Май 2026 — настоящее время».' })
  period!: string

  @Field(() => String, { nullable: true })
  dateStart?: string | null

  @Field(() => String, { nullable: true })
  dateEnd?: string | null

  @Field()
  isCurrent!: boolean

  @Field(() => String, { nullable: true })
  location?: string | null

  @Field({ description: 'Что за продукт, в двух предложениях.' })
  summary!: string

  @Field(() => [AchievementType])
  achievements!: AchievementType[]

  @Field(() => Int, { description: 'Сколько буллетов всего в базе, включая скрытые на витрине.' })
  achievementsTotal!: number
}
