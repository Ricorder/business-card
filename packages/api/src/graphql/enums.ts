import { registerEnumType } from '@nestjs/graphql'
import {
  achievementCategorySchema,
  contactKindSchema,
  languageLevelSchema,
  searchHitKindSchema,
  visibilitySchema,
} from '@card/contracts'

/**
 * SQLite не хранит enum, поэтому значения живут строками в базе, а здесь
 * превращаются в настоящие GraphQL-enum'ы. Совпадение имён с SDL проверяет
 * сквозной тест в test/graphql.e2e-spec.ts — расхождение ловится до сборки
 * артефакта, а не на проде.
 *
 * Имена членов намеренно в нижнем регистре, вопреки конвенции SCREAMING_SNAKE:
 * GraphQL печатает имя члена как значение на проводе, и с ключами в верхнем
 * регистре появилось бы два словаря — «backend» в базе и «BACKEND» в API, с
 * переводом на обеих границах. Одно имя во всех трёх местах дороже косметики
 * в SDL; спецификация GraphQL таких ограничений не накладывает.
 */
export enum ContactKind {
  telegram = 'telegram',
  github = 'github',
  email = 'email',
  phone = 'phone',
  website = 'website',
  other = 'other',
}

export enum Visibility {
  public = 'public',
  private = 'private',
}

export enum AchievementCategory {
  backend = 'backend',
  frontend = 'frontend',
  mobile = 'mobile',
  quality = 'quality',
  infra = 'infra',
  analytics = 'analytics',
}

export enum LanguageLevel {
  native = 'native',
  b2 = 'b2',
  b1 = 'b1',
  a2 = 'a2',
  a1 = 'a1',
}

export enum SearchHitKind {
  achievement = 'achievement',
  project = 'project',
  skill = 'skill',
  experience = 'experience',
}

export const ENUM_CONTRACTS = {
  ContactKind: { enumType: ContactKind, graphqlName: 'ContactKind', zod: contactKindSchema },
  Visibility: { enumType: Visibility, graphqlName: 'Visibility', zod: visibilitySchema },
  AchievementCategory: {
    enumType: AchievementCategory,
    graphqlName: 'AchievementCategory',
    zod: achievementCategorySchema,
  },
  LanguageLevel: { enumType: LanguageLevel, graphqlName: 'LanguageLevel', zod: languageLevelSchema },
  SearchHitKind: { enumType: SearchHitKind, graphqlName: 'SearchHitKind', zod: searchHitKindSchema },
} as const

for (const [name, spec] of Object.entries(ENUM_CONTRACTS)) {
  registerEnumType(spec.enumType, {
    name: spec.graphqlName,
    description: `Значение перечисления ${name}; источник истины — zod-union в @card/contracts.`,
  })
}
