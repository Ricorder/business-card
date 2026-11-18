import { Injectable } from '@nestjs/common'
import type { Card, Resume } from '@card/contracts'
import { cardSchema, resumeSchema } from '@card/contracts'
import { PrismaService } from '../prisma/prisma.service.js'

/**
 * Единственный источник данных витрины и резюме — SQLite через Prisma.
 * Никаких хардкод-объектов в резолвере: поменяли сид, изменился и GraphQL, и страница.
 *
 * Ответ дополнительно проходит через zod-схему из @card/contracts. Это граница
 * между бэкендом и фронтендом: если сид или миграция разъедутся с контрактом,
 * запрос упадёт здесь с внятной ошибкой, а не молча отдаст undefined в браузере.
 */
@Injectable()
export class CardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Витрина: featured-буллеты и публичные контакты. */
  async getCard(): Promise<Card> {
    const [profile, metrics, experiences, skillGroups, links, languages] = await Promise.all([
      this.prisma.profile.findFirstOrThrow({ orderBy: { createdAt: 'asc' } }),
      this.prisma.metric.findMany({ orderBy: { position: 'asc' } }),
      this.prisma.experience.findMany({
        orderBy: { position: 'asc' },
        include: {
          achievements: { where: { featured: true }, orderBy: { position: 'asc' } },
          _count: { select: { achievements: true } },
        },
      }),
      this.prisma.skillGroup.findMany({
        orderBy: { position: 'asc' },
        include: { skills: { where: { featured: true }, orderBy: { position: 'asc' } } },
      }),
      this.prisma.contactLink.findMany({
        where: { visibility: 'public' },
        orderBy: { position: 'asc' },
      }),
      this.prisma.languageSkill.findMany({ orderBy: { position: 'asc' } }),
    ])

    return cardSchema.parse({
      profile: this.mapProfile(profile),
      metrics: metrics.map((m) => ({ ...m, detail: m.detail ?? null })),
      experiences: experiences.map((e) => this.mapExperience(e)),
      skillGroups: skillGroups.map((g) => ({
        ...g,
        skills: g.skills.map((s) => ({ ...s, note: s.note ?? null })),
      })),
      links: links.map((l) => ({ kind: l.kind, label: l.label, url: l.url, position: l.position, id: l.id })),
      languages: languages.map((l) => ({ id: l.id, name: l.name, level: l.level, position: l.position })),
    })
  }

  /** Полное резюме: все буллеты, проекты, образование. */
  async getResume(): Promise<Resume> {
    const [profile, metrics, experiences, projects, skillGroups, languages, education, links] = await Promise.all([
      this.prisma.profile.findFirstOrThrow({ orderBy: { createdAt: 'asc' } }),
      this.prisma.metric.findMany({ orderBy: { position: 'asc' } }),
      this.prisma.experience.findMany({
        orderBy: { position: 'asc' },
        include: {
          achievements: { orderBy: { position: 'asc' } },
          _count: { select: { achievements: true } },
        },
      }),
      this.prisma.project.findMany({ orderBy: { position: 'asc' }, include: { stack: { orderBy: { position: 'asc' } } } }),
      this.prisma.skillGroup.findMany({
        orderBy: { position: 'asc' },
        include: { skills: { orderBy: { position: 'asc' } } },
      }),
      this.prisma.languageSkill.findMany({ orderBy: { position: 'asc' } }),
      this.prisma.education.findMany({ orderBy: { position: 'asc' } }),
      this.prisma.contactLink.findMany({
        where: { visibility: 'public' },
        orderBy: { position: 'asc' },
      }),
    ])

    return resumeSchema.parse({
      profile: this.mapProfile(profile),
      metrics: metrics.map((m) => ({ ...m, detail: m.detail ?? null })),
      experiences: experiences.map((e) => this.mapExperience(e)),
      projects: projects.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        summary: p.summary,
        year: p.year ?? null,
        url: p.url ?? null,
        position: p.position,
        stack: p.stack.map((s) => s.name),
      })),
      skillGroups: skillGroups.map((g) => ({
        ...g,
        skills: g.skills.map((s) => ({ ...s, note: s.note ?? null })),
      })),
      languages: languages.map((l) => ({ id: l.id, name: l.name, level: l.level, position: l.position })),
      education: education.map((e) => ({ ...e, note: e.note ?? null })),
      links: links.map((l) => ({ kind: l.kind, label: l.label, url: l.url, position: l.position, id: l.id })),
    })
  }

  private mapProfile(profile: {
    id: string
    handle: string
    displayName: string
    title: string
    tagline: string
    location: string
    summary: string
    timezone: string | null
    updatedAt: Date
  }) {
    return {
      id: profile.id,
      handle: profile.handle,
      displayName: profile.displayName,
      title: profile.title,
      tagline: profile.tagline,
      location: profile.location,
      summary: profile.summary,
      timezone: profile.timezone,
      updatedAt: profile.updatedAt.toISOString(),
    }
  }

  private mapExperience(experience: {
    id: string
    slug: string
    company: string
    companyNote: string | null
    role: string
    period: string
    dateStart: string | null
    dateEnd: string | null
    isCurrent: boolean
    location: string | null
    summary: string
    achievements: Array<{ id: string; text: string; category: string; position: number }>
    _count?: { achievements: number }
  }) {
    return {
      id: experience.id,
      slug: experience.slug,
      company: experience.company,
      companyNote: experience.companyNote,
      role: experience.role,
      period: experience.period,
      dateStart: experience.dateStart,
      dateEnd: experience.dateEnd,
      isCurrent: experience.isCurrent,
      location: experience.location,
      summary: experience.summary,
      achievements: experience.achievements.map((a) => ({
        id: a.id,
        text: a.text,
        category: a.category,
        position: a.position,
      })),
      achievementsTotal: experience._count?.achievements ?? experience.achievements.length,
    }
  }
}
