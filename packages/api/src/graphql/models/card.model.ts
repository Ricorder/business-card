import { Field, ObjectType } from '@nestjs/graphql'
import { ExperienceType } from './experience.model.js'
import { EducationType, LanguageType, ProjectType, SkillGroupType } from './catalog.model.js'
import { ContactLinkType, MetricType, ProfileType } from './profile.model.js'

@ObjectType('Card', {
  description:
    'Витрина: отобранный срез резюме, который читается за 40 секунд. ' +
    'Полное содержимое лежит в той же базе и отдаётся запросом resume.',
})
export class CardType {
  @Field(() => ProfileType)
  profile!: ProfileType

  @Field(() => [MetricType])
  metrics!: MetricType[]

  @Field(() => [ExperienceType])
  experiences!: ExperienceType[]

  @Field(() => [SkillGroupType])
  skillGroups!: SkillGroupType[]

  @Field(() => [ContactLinkType], { description: 'Только публичные контакты.' })
  links!: ContactLinkType[]

  @Field(() => [LanguageType])
  languages!: LanguageType[]
}

@ObjectType('Resume', { description: 'Полное резюме: все буллеты, проекты и образование.' })
export class ResumeType {
  @Field(() => ProfileType)
  profile!: ProfileType

  @Field(() => [MetricType])
  metrics!: MetricType[]

  @Field(() => [ExperienceType])
  experiences!: ExperienceType[]

  @Field(() => [ProjectType])
  projects!: ProjectType[]

  @Field(() => [SkillGroupType])
  skillGroups!: SkillGroupType[]

  @Field(() => [LanguageType])
  languages!: LanguageType[]

  @Field(() => [EducationType])
  education!: EducationType[]

  @Field(() => [ContactLinkType])
  links!: ContactLinkType[]
}
