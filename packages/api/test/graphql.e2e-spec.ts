import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { buildSchema, getNamedType, GraphQLNamedType, GraphQLObjectType } from 'graphql'
import { CARD_QUERY, RESUME_QUERY, cardSchema, healthSchema, resumeSchema, searchResultSchema } from '@card/contracts'
import { AppModule } from '../src/app.module.js'
import { TEST_DATABASE_URL } from './global-setup.js'

process.env.DATABASE_URL ??= TEST_DATABASE_URL
process.env.STATIC_DIR ??= ''
process.env.GRAPHIQL ??= 'false'
process.env.CARD_APP_VERSION ??= 'test'

const databaseUrl = process.env.DATABASE_URL

const HEALTH_QUERY = 'query { health { status version databaseConnected records uptimeSeconds } }'

interface GraphqlBody {
  data?: Record<string, unknown> | null
  errors?: Array<{ message?: string }>
}

interface InjectReply {
  statusCode: number
  body: string
  json(): GraphqlBody
}

type InjectOptions = { method: 'GET' | 'POST'; url: string; headers?: Record<string, string>; payload?: string }

interface InjectableInstance {
  inject(options: InjectOptions): Promise<InjectReply>
}

/**
 * Сквозной прогон настоящего стека: SQLite-файл из global-setup (миграции и
 * сид), Nest на Fastify, GraphQL-модуль и резолверы. Транспорт — `inject`,
 * без поднятого порта и без supertest: проверяется то же самое, слоёв меньше.
 *
 * Основные проверки идут документами из @card/contracts — теми же строками,
 * которые отправляет браузер. С сокращённой выборкой тест мог бы остаться
 * зелёным, а страница упасть на полном ответе.
 */
describe('GraphQL API сквозняком', () => {
  let app: NestFastifyApplication
  let instance: InjectableInstance

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
    await app.init()
    instance = app.getHttpAdapter().getInstance() as unknown as InjectableInstance
  })

  afterAll(async () => {
    await app?.close()
  })

  async function gql(query: string, variables?: Record<string, unknown>): Promise<InjectReply> {
    return instance.inject({
      method: 'POST',
      url: '/graphql',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      payload: JSON.stringify({ query, variables }),
    })
  }

  it('card отвечает без ошибок и проходит контракт целиком', async () => {
    const response = await gql(CARD_QUERY)

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.errors).toBeUndefined()

    const card = cardSchema.parse(body.data?.card)
    expect(card.profile.displayName).toBe('Евгений Колесников')
    expect(card.links.map((link) => link.kind).sort()).toEqual(['email', 'github', 'telegram'])
    expect(card.experiences.every((experience) => experience.achievements.length <= 4)).toBe(true)
    expect(card.experiences[0]?.companyNote).toContain('NDA')
    expect(card.skillGroups.every((group) => group.skills.length > 0)).toBe(true)
  })

  it('resume отдаёт больше фактов, чем card, из той же базы', async () => {
    const cardResponse = await gql(CARD_QUERY)
    const resumeResponse = await gql(RESUME_QUERY)

    const resumeBody = resumeResponse.json()
    expect(resumeBody.errors).toBeUndefined()
    const resume = resumeSchema.parse(resumeBody.data?.resume)
    const card = cardSchema.parse(cardResponse.json().data?.card)

    const onCard = card.experiences.reduce((sum, experience) => sum + experience.achievements.length, 0)
    const inResume = resume.experiences.reduce((sum, experience) => sum + experience.achievements.length, 0)

    expect(inResume).toBeGreaterThan(onCard)
    expect(resume.experiences.every((e) => e.achievements.length === e.achievementsTotal)).toBe(true)
    expect(resume.projects.length).toBeGreaterThan(0)
    expect(resume.education.some((entry) => entry.school.includes('МЭСИ'))).toBe(true)
  })

  it('search находит текст, которого нет на витрине', async () => {
    // «jsonb» встречается только в буллете, не отмеченном featured: находка
    // доказывает, что поиск идёт по всему содержимому, а не по тому, что
    // уже нарисовано на карточке.
    const response = await gql(
      'query($q: String!, $limit: Int) { search(query: $q, limit: $limit) { query total hits { id kind title text company } } }',
      { q: 'jsonb', limit: 5 },
    )

    const body = response.json()
    expect(body.errors).toBeUndefined()

    const result = searchResultSchema.parse(body.data?.search)
    expect(result.query).toBe('jsonb')
    expect(result.total).toBeGreaterThan(0)
    expect(result.hits[0]?.kind).toBe('achievement')

    const card = cardSchema.parse((await gql(CARD_QUERY)).json().data?.card)
    expect(JSON.stringify(card)).not.toContain('jsonb')
  })

  it('search отказывает на запросе короче двух символов', async () => {
    const response = await gql('query { search(query: "я") { total } }')

    expect(response.json().errors?.[0]?.message).toMatch(/не короче 2 символов/u)
  })

  it('health сообщает состояние базы и число записей', async () => {
    const response = await gql(HEALTH_QUERY)

    const health = healthSchema.parse(response.json().data?.health)
    expect(health.databaseConnected).toBe(true)
    expect(health.status).toBe('ok')
    expect(health.records).toBeGreaterThan(50)
    expect(health.version).toBe('test')
  })

  it('приватный контакт остаётся приватным, даже когда он лежит в базе', async () => {
    const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')
    const { PrismaClient } = await import('../src/generated/prisma/client.js')
    const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) })

    const profile = await prisma.profile.findFirstOrThrow()
    await prisma.contactLink.create({
      data: {
        profileId: profile.id,
        kind: 'phone',
        label: '+7 900 000-00-00',
        url: 'tel:+79000000000',
        visibility: 'private',
        position: 99,
      },
    })

    try {
      const card = await gql('query { card { links { kind label url } } }')
      const resume = await gql('query { resume { links { kind } } }')
      const search = await gql('query { search(query: "000-00") { total } }')

      const linksOf = (payload: GraphqlBody): string[] => {
        const root = (payload.data?.card ?? payload.data?.resume) as { links?: Array<{ kind: string }> } | undefined
        return (root?.links ?? []).map((link) => link.kind)
      }

      expect(linksOf(card.json())).not.toContain('phone')
      expect(linksOf(resume.json())).not.toContain('phone')
      expect(search.json().data?.search).toEqual({ total: 0 })
      expect(card.body).not.toContain('900 000')
    } finally {
      await prisma.contactLink.deleteMany({ where: { profileId: profile.id, visibility: 'private' } })
      await prisma.$disconnect()
    }
  })

  it('SDL не расходится с zod-контрактом: лишнее или потерянное поле ловится здесь', () => {
    const sdl = readFileSync(join(process.cwd(), 'schema.graphql'), 'utf8')
    const schema = buildSchema(sdl, { assumeValidSDL: true })

    const expectations: Array<[string, Record<string, unknown>]> = [
      ['Card', cardSchema.shape],
      ['Resume', resumeSchema.shape],
      ['SearchResult', searchResultSchema.shape],
      ['Health', healthSchema.shape],
    ]

    for (const [typeName, shape] of expectations) {
      const type = getNamedType(schema.getType(typeName) as GraphQLNamedType) as GraphQLObjectType
      const fields = Object.keys(type.getFields())
      expect(fields.sort()).toEqual(Object.keys(shape).sort())
    }
  })

  it('GET /healthz остаётся REST-здоровьем для контейнера', async () => {
    const response = await instance.inject({ method: 'GET', url: '/healthz' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveProperty('status', 'ok')
  })
})
