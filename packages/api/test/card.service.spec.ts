import { jest } from '@jest/globals'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { CardService } from '../src/card/card.service.js'

type Args = Record<string, unknown>

interface Recorded {
  model: string
  args?: Args
}

/**
 * Дубль Prisma записывает аргументы запросов: важно, что отбор витрины делает
 * база (where featured / visibility public), а не резолвер постфактум. Иначе
 * `resume` и `card` расходились бы по числу строк, и `achievementsTotal`
 * было бы неоткуда взять.
 */
function prismaDouble() {
  const calls: Recorded[] = []

  const record = (model: string) =>
    jest.fn(async (args?: Args) => {
      calls.push({ model, args })
      return modelResult(model, args)
    })

  const client = {
    profile: { findFirstOrThrow: record('profile') },
    metric: { findMany: record('metric') },
    experience: { findMany: record('experience') },
    skillGroup: { findMany: record('skillGroup') },
    contactLink: { findMany: record('contactLink') },
    languageSkill: { findMany: record('languageSkill') },
    project: { findMany: record('project') },
    education: { findMany: record('education') },
  }

  return { calls, client: client as unknown as PrismaService }
}

function modelResult(model: string, args?: Args): unknown {
  switch (model) {
    case 'profile':
      return {
        id: 'prof-1',
        handle: 'evgeny-kolesnikov',
        displayName: 'Евгений Колесников',
        title: 'Fullstack-разработчик',
        tagline: '…',
        location: 'Москва',
        summary: '…',
        timezone: 'Europe/Moscow',
        createdAt: new Date('2026-11-18T09:00:00.000Z'),
        updatedAt: new Date('2026-11-18T09:00:00.000Z'),
      }
    case 'metric':
      return [{ id: 'm1', value: '4000+', label: 'тестов', detail: null, position: 0 }]
    case 'experience': {
      const include = args?.include as { achievements?: Args; _count?: Args } | undefined
      const where = include?.achievements?.where as { featured?: boolean } | undefined
      const achievements = where?.featured
        ? [{ id: 'a1', text: 'featured-буллет', category: 'backend', position: 0 }]
        : [
            { id: 'a1', text: 'featured-буллет', category: 'backend', position: 0 },
            { id: 'a2', text: 'второй', category: 'quality', position: 10 },
          ]
      return [
        {
          id: 'exp-1',
          slug: 'construction-platform',
          company: 'Строительная компания',
          companyNote: 'NDA',
          role: 'Fullstack-разработчик',
          period: 'Май 2026 — настоящее время',
          dateStart: '2026-05',
          dateEnd: null,
          isCurrent: true,
          location: 'Москва',
          summary: 'Платформа учёта времени',
          achievements,
          _count: { achievements: 2 },
        },
      ]
    }
    case 'skillGroup':
      return [
        {
          id: 'g1',
          slug: 'backend',
          name: 'Бэкенд и данные',
          position: 0,
          skills: [{ id: 's1', name: 'NestJS', note: null, featured: true, position: 0 }],
        },
      ]
    case 'contactLink':
      return [{ id: 'c1', kind: 'telegram', label: '@voltigeurs', url: 'https://t.me/voltigeurs', position: 0 }]
    case 'languageSkill':
      return [{ id: 'l1', name: 'Русский', level: 'native', position: 0 }]
    case 'project':
      return [
        {
          id: 'pr1',
          slug: 'alfa-metatrader',
          name: 'Альфа-банк × MetaTrader',
          summary: '…',
          year: '2023–2026',
          url: null,
          position: 0,
          stack: [{ id: 'st1', name: 'Next.js', position: 0 }],
        },
      ]
    case 'education':
      return [{ id: 'ed1', school: 'МЭСИ', year: '2012', degree: 'Специалист', note: null, position: 0 }]
    default:
      return []
  }
}

describe('CardService', () => {
  it('витрина фильтрует буллеты и видимость запросом к базе, а не на лету', async () => {
    const { calls, client } = prismaDouble()
    const service = new CardService(client)

    const card = await service.getCard()

    const experiencesCall = calls.find((call) => call.model === 'experience')
    const include = experiencesCall?.args?.include as { achievements?: { where?: { featured?: boolean } } }
    expect(include.achievements?.where).toMatchObject({ featured: true })

    const linksCall = calls.find((call) => call.model === 'contactLink')
    expect(linksCall?.args).toMatchObject({ where: { visibility: 'public' } })

    expect(card.experiences[0]?.achievements).toHaveLength(1)
  })

  it('резюме снимает фильтр featured, а achievementsTotal остаётся общим числом буллетов', async () => {
    const { calls, client } = prismaDouble()
    const service = new CardService(client)

    const resume = await service.getResume()

    const experiencesCall = calls.find((call) => call.model === 'experience')
    const include = experiencesCall?.args?.include as { achievements?: { where?: { featured?: boolean } } }
    expect(include.achievements?.where).toBeUndefined()

    expect(resume.experiences[0]?.achievements).toHaveLength(2)
    expect(resume.experiences[0]?.achievementsTotal).toBe(2)
    expect(resume.projects[0]?.stack).toEqual(['Next.js'])
  })

  it('приватный контакт не просочится: фильтр стоит в самом запросе к базе', async () => {
    const { client } = prismaDouble()
    const service = new CardService(client)

    const card = await service.getCard()

    expect(card.links.map((link) => link.kind)).toEqual(['telegram'])
    expect(JSON.stringify(card)).not.toContain('tel:')
  })

  it('ISO-строка updatedAt переживает границу контракта', async () => {
    const { client } = prismaDouble()
    const service = new CardService(client)

    const card = await service.getCard()

    expect(card.profile.updatedAt).toBe('2026-11-18T09:00:00.000Z')
  })
})
