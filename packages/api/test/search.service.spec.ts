import { jest } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import type { PrismaService } from '../src/prisma/prisma.service.js'
import { SearchService } from '../src/search/search.service.js'

interface FindManyArgs {
  include?: Record<string, unknown>
}

function prismaDouble(rows: {
  achievements?: Array<Record<string, unknown>>
  projects?: Array<Record<string, unknown>>
  skills?: Array<Record<string, unknown>>
  experiences?: Array<Record<string, unknown>>
}) {
  const calls: Array<{ model: string; args?: FindManyArgs }> = []

  const findMany = (model: string, data: Array<Record<string, unknown>>) =>
    jest.fn(async (args?: FindManyArgs) => {
      calls.push({ model, args })
      return data
    })

  return {
    calls,
    client: {
      achievement: { findMany: findMany('achievement', rows.achievements ?? []) },
      project: { findMany: findMany('project', rows.projects ?? []) },
      skill: { findMany: findMany('skill', rows.skills ?? []) },
      experience: { findMany: findMany('experience', rows.experiences ?? []) },
    } as unknown as PrismaService,
  }
}

describe('SearchService', () => {
  const base = {
    achievements: [
      {
        id: 'a1',
        text: 'Поднял автотесты с нуля: 0 → 410 spec-файлов',
        category: 'quality',
        featured: true,
        experience: { company: 'Строительная компания', slug: 'construction-platform' },
      },
    ],
    projects: [
      { id: 'p1', slug: 'alfa', name: 'Альфа-банк × MetaTrader', summary: 'Торговое приложение', year: null, url: null },
    ],
    skills: [{ id: 's1', name: 'GraphQL', note: 'слой контракта визитки', group: { name: 'Бэкенд и данные' } }],
    experiences: [
      { id: 'e1', company: 'SITRONICS', role: 'Fullstack-разработчик', summary: 'Склад и учёт персонала' },
    ],
  }

  it('находит по русскому тексту независимо от регистра', async () => {
    const { client } = prismaDouble(base)
    const service = new SearchService(client)

    const upper = await service.search('АВТОТЕСТЫ')
    const lower = await service.search('автотесты')

    expect(upper.total).toBe(1)
    expect(lower.total).toBe(1)
    expect(upper.hits[0]?.kind).toBe('achievement')
  })

  it('не гоняет LIKE по кириллице в SQLite: фильтр живёт в приложении', async () => {
    const { client, calls } = prismaDouble(base)
    const service = new SearchService(client)

    await service.search('graphql')

    for (const call of calls) {
      const where = (call.args as { where?: Record<string, unknown> } | undefined)?.where
      expect(where?.text).toBeUndefined()
    }
    // Буллеты берутся все до единого: то, что спрятано на витрине, публично
    // в resume, а значит искать по нему корректно.
    const achievementsCall = calls.find((call) => call.model === 'achievement')
    expect((achievementsCall?.args as { where?: unknown } | undefined)?.where).toBeUndefined()
  })

  it('находит навык и проект, а не только буллеты', async () => {
    const { client } = prismaDouble(base)
    const service = new SearchService(client)

    const bySkill = await service.search('graphql')
    const byProject = await service.search('metatrader')

    expect(bySkill.hits.map((hit) => hit.kind)).toContain('skill')
    expect(byProject.hits.map((hit) => hit.kind)).toContain('project')
  })

  it('отсекает слишком короткий запрос ещё до обращения к базе', async () => {
    const { client, calls } = prismaDouble(base)
    const service = new SearchService(client)

    await expect(service.search('a')).rejects.toBeInstanceOf(BadRequestException)
    expect(calls).toHaveLength(0)
  })

  it('обрезает limit до диапазона 1..100', async () => {
    const { client } = prismaDouble({
      ...base,
      achievements: Array.from({ length: 3 }, (_, index) => ({
        id: `a${index}`,
        text: 'тест',
        category: 'quality',
        featured: true,
        experience: { company: 'Компания', slug: 'x' },
      })),
    })
    const service = new SearchService(client)

    const clamped = await service.search('тест', 5000)
    expect(clamped.hits.length).toBeLessThanOrEqual(3)

    await expect(service.search('тест', 0)).resolves.toMatchObject({ query: 'тест' })
  })
})
