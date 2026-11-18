import { Field, Int, ObjectType } from '@nestjs/graphql'
import { LanguageLevel } from '../enums.js'

@ObjectType('Skill', { description: 'Технология в группе.' })
export class SkillType {
  @Field()
  id!: string

  @Field()
  name!: string

  @Field(() => String, { nullable: true, description: 'Контекст: где именно применялась.' })
  note?: string | null

  @Field(() => Boolean, { description: 'На витрине показаны только featured; в resume — все навыки группы.' })
  featured!: boolean

  @Field(() => Int)
  position!: number
}

@ObjectType('SkillGroup', { description: 'Группа стека: фронтенд, бэкенд, данные, инструментальное.' })
export class SkillGroupType {
  @Field()
  id!: string

  @Field()
  slug!: string

  @Field()
  name!: string

  @Field(() => Int)
  position!: number

  @Field(() => [SkillType])
  skills!: SkillType[]
}

@ObjectType('Project', { description: 'Продукт, а не место работы: что сделано и на чём.' })
export class ProjectType {
  @Field()
  id!: string

  @Field()
  slug!: string

  @Field()
  name!: string

  @Field()
  summary!: string

  @Field(() => String, { nullable: true })
  year?: string | null

  @Field(() => String, { nullable: true, description: 'Публичная ссылка, если она есть и её можно показывать.' })
  url?: string | null

  @Field(() => Int)
  position!: number

  @Field(() => [String], { description: 'Отдельная таблица в SQLite, а не CSV-строка.' })
  stack!: string[]
}

@ObjectType('Language', { description: 'Владение языком человека, а не программирования.' })
export class LanguageType {
  @Field()
  id!: string

  @Field()
  name!: string

  @Field(() => LanguageLevel)
  level!: LanguageLevel

  @Field(() => Int)
  position!: number
}

@ObjectType('Education', { description: 'Образование.' })
export class EducationType {
  @Field()
  id!: string

  @Field()
  school!: string

  @Field()
  year!: string

  @Field()
  degree!: string

  @Field(() => String, { nullable: true })
  note?: string | null

  @Field(() => Int)
  position!: number
}
