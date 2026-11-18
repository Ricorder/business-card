import { z } from 'zod'

/**
 * Контракты между @card/api (NestJS + GraphQL) и @card/web (Next.js).
 *
 * SQLite не умеет enum-типы, поэтому `kind`/`visibility`/`level` остаются
 * строками в базе, а здесь сужаются до union'ов — схема ловит опечатку в сиде
 * до выкатки, а не после.
 */

export const contactKindSchema = z.enum(['telegram', 'github', 'email', 'phone', 'website', 'other'])
export const visibilitySchema = z.enum(['public', 'private'])
export const achievementCategorySchema = z.enum(['backend', 'frontend', 'mobile', 'quality', 'infra', 'analytics'])
export const languageLevelSchema = z.enum(['native', 'b2', 'b1', 'a2', 'a1'])
export const searchHitKindSchema = z.enum(['achievement', 'project', 'skill', 'experience'])

export const profileSchema = z.object({
  id: z.string(),
  handle: z.string(),
  displayName: z.string(),
  title: z.string(),
  tagline: z.string(),
  location: z.string(),
  summary: z.string(),
  timezone: z.string().nullable(),
  updatedAt: z.string(),
})

export const contactLinkSchema = z.object({
  id: z.string(),
  kind: contactKindSchema,
  label: z.string(),
  url: z.string(),
  position: z.number().int(),
})

export const metricSchema = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
  detail: z.string().nullable(),
  position: z.number().int(),
})

export const achievementSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: achievementCategorySchema,
  position: z.number().int(),
})

export const experienceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  company: z.string(),
  companyNote: z.string().nullable(),
  role: z.string(),
  period: z.string(),
  dateStart: z.string().nullable(),
  dateEnd: z.string().nullable(),
  isCurrent: z.boolean(),
  location: z.string().nullable(),
  summary: z.string(),
  /** На витрине — не больше трёх буллетов на место работы; полное число только в `resume`. */
  achievements: z.array(achievementSchema),
  achievementsTotal: z.number().int(),
})

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  note: z.string().nullable(),
  /** true — навык попадает на витрину; в resume отдаются все. */
  featured: z.boolean(),
  position: z.number().int(),
})

export const skillGroupSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  position: z.number().int(),
  skills: z.array(skillSchema),
})

export const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  summary: z.string(),
  year: z.string().nullable(),
  url: z.string().nullable(),
  position: z.number().int(),
  stack: z.array(z.string()),
})

export const languageSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: languageLevelSchema,
  position: z.number().int(),
})

export const educationSchema = z.object({
  id: z.string(),
  school: z.string(),
  year: z.string(),
  degree: z.string(),
  note: z.string().nullable(),
  position: z.number().int(),
})

/** Срез «читать 40 секунд»: то, что видит рекрутер на витрине. */
export const cardSchema = z.object({
  profile: profileSchema,
  metrics: z.array(metricSchema),
  experiences: z.array(experienceSchema),
  skillGroups: z.array(skillGroupSchema),
  links: z.array(contactLinkSchema),
  languages: z.array(languageSchema),
})

/** Полное резюме: все буллеты, проекты, образование. Отдаётся тем же GraphQL. */
export const resumeSchema = z.object({
  profile: profileSchema,
  metrics: z.array(metricSchema),
  experiences: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skillGroups: z.array(skillGroupSchema),
  languages: z.array(languageSchema),
  education: z.array(educationSchema),
  links: z.array(contactLinkSchema),
})

export const healthSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  version: z.string(),
  uptimeSeconds: z.number(),
  databaseConnected: z.boolean(),
  records: z.number().int(),
})

export const searchHitSchema = z.object({
  id: z.string(),
  kind: searchHitKindSchema,
  title: z.string(),
  text: z.string(),
  company: z.string().nullable(),
})

export const searchResultSchema = z.object({
  query: z.string(),
  total: z.number().int(),
  hits: z.array(searchHitSchema),
})

export type ContactKind = z.infer<typeof contactKindSchema>
export type Visibility = z.infer<typeof visibilitySchema>
export type AchievementCategory = z.infer<typeof achievementCategorySchema>
export type LanguageLevel = z.infer<typeof languageLevelSchema>
export type SearchHitKind = z.infer<typeof searchHitKindSchema>
export type Profile = z.infer<typeof profileSchema>
export type ContactLink = z.infer<typeof contactLinkSchema>
export type Metric = z.infer<typeof metricSchema>
export type Achievement = z.infer<typeof achievementSchema>
export type Experience = z.infer<typeof experienceSchema>
export type Skill = z.infer<typeof skillSchema>
export type SkillGroup = z.infer<typeof skillGroupSchema>
export type Project = z.infer<typeof projectSchema>
export type Language = z.infer<typeof languageSchema>
export type Education = z.infer<typeof educationSchema>
export type Card = z.infer<typeof cardSchema>
export type Resume = z.infer<typeof resumeSchema>
export type Health = z.infer<typeof healthSchema>
export type SearchHit = z.infer<typeof searchHitSchema>
export type SearchResult = z.infer<typeof searchResultSchema>

export const CARD_OPERATIONS = {
  card: cardSchema,
  resume: resumeSchema,
  health: healthSchema,
  search: searchResultSchema,
} as const

export type CardOperationName = keyof typeof CARD_OPERATIONS
