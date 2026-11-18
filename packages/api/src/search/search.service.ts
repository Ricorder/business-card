import { BadRequestException, Injectable } from '@nestjs/common'
import type { SearchHit, SearchResult } from '@card/contracts'
import { searchResultSchema } from '@card/contracts'
import { PrismaService } from '../prisma/prisma.service.js'

const MIN_QUERY_LENGTH = 2
const MAX_QUERY_LENGTH = 64
const MAX_LIMIT = 100

/**
 * Поиск по содержимому визитки.
 *
 * Почему на стороне приложения, а не `WHERE ... LIKE`: SQLite регистронезависим
 * только для латиницы — `contains` по-русски («GraphQL» против «graphql»)
 * молча промахивается, а содержимое визитки всё раскидано по-русски. Строк в
 * базе десятки, поэтому вычитать их целиком дешевле, чем городить ICU-расширение
 * или триграммный индекс; сортировка по весу типа находки остаётся предсказуемой.
 */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(rawQuery: string, rawLimit?: number | null): Promise<SearchResult> {
    const query = rawQuery.trim()

    if (query.length < MIN_QUERY_LENGTH) {
      throw new BadRequestException(`Запрос должен быть не короче ${MIN_QUERY_LENGTH} символов`)
    }
    if (query.length > MAX_QUERY_LENGTH) {
      throw new BadRequestException(`Запрос длиннее ${MAX_QUERY_LENGTH} символов не обслуживается`)
    }

    const limit = Math.min(Math.max(Math.trunc(rawLimit ?? 20), 1), MAX_LIMIT)
    const needle = query.toLocaleLowerCase('ru')

    const [achievements, projects, skills, experiences] = await Promise.all([
      // Ищем по всем буллетам, а не только по витринным: непрятанные на card
      // строки публичны в resume, значит они законная мишень для поиска.
      this.prisma.achievement.findMany({
        include: { experience: { select: { company: true } } },
        orderBy: { position: 'asc' },
      }),
      this.prisma.project.findMany({ orderBy: { position: 'asc' } }),
      this.prisma.skill.findMany({
        include: { group: { select: { name: true } } },
        orderBy: { position: 'asc' },
      }),
      this.prisma.experience.findMany({ orderBy: { position: 'asc' } }),
    ])

    const hits: SearchHit[] = [
      ...achievements
        .filter((a) => matches(needle, a.text))
        .map<SearchHit>((a) => ({
          id: a.id,
          kind: 'achievement',
          title: a.experience.company,
          text: a.text,
          company: a.experience.company,
        })),
      ...projects
        .filter((p) => matches(needle, p.name, p.summary))
        .map<SearchHit>((p) => ({ id: p.id, kind: 'project', title: p.name, text: p.summary, company: null })),
      ...skills
        .filter((s) => matches(needle, s.name, s.note ?? ''))
        .map<SearchHit>((s) => ({
          id: s.id,
          kind: 'skill',
          title: `${s.name} — ${s.group.name}`,
          text: s.note ?? s.name,
          company: null,
        })),
      ...experiences
        .filter((e) => matches(needle, e.company, e.role, e.summary))
        .map<SearchHit>((e) => ({ id: e.id, kind: 'experience', title: `${e.role}, ${e.company}`, text: e.summary, company: e.company })),
    ]

    const ranked = rank(hits, needle)

    return searchResultSchema.parse({
      query,
      total: ranked.length,
      hits: ranked.slice(0, limit),
    })
  }
}

function matches(needle: string, ...haystacks: Array<string | null>): boolean {
  return haystacks.some((h) => h !== null && h.toLocaleLowerCase('ru').includes(needle))
}

const KIND_WEIGHT: Record<SearchHit['kind'], number> = {
  achievement: 0,
  skill: 1,
  project: 2,
  experience: 3,
}

/** Совпадение в начале строки ценится выше, чем в середине — иначе порядок выглядит случайным. */
function rank(hits: SearchHit[], needle: string): SearchHit[] {
  return hits
    .map((hit) => ({ hit, weight: KIND_WEIGHT[hit.kind] * 10 + (startsWith(needle, hit.title) ? 0 : 3) }))
    .sort((a, b) => a.weight - b.weight)
    .map((entry) => entry.hit)
}

function startsWith(needle: string, text: string): boolean {
  return text.toLocaleLowerCase('ru').startsWith(needle)
}
