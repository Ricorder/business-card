import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { Prisma, PrismaClient } from '../generated/prisma/client.js'
import { content } from './content.js'

/**
 * Сид из src/seed/content.ts. Идемпотентен: повторный прогон приводит базу к
 * содержимому файла, а не удваивает строки. Поэтому его можно вызывать на
 * старте контейнера после `migrate deploy` — пустая база наполнится, а
 * наполненная обновится до актуального текста.
 *
 * Файл лежит в src/, а не в prisma/, специально: в рантайме контейнера нет ни
 * tsx, ни ts-node, и сид должен запускаться скомпилированным
 * `node dist/seed/seed.js`. Точка входа для `prisma db seed` — тонкий shim в
 * prisma/seed.ts.
 */

const POSITION_STEP = 10

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL не задан — сид не знает, куда писать')
  }

  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })

  try {
    const stats = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { handle: content.profile.handle },
        create: { ...content.profile, updatedAt: new Date() },
        update: { ...content.profile, updatedAt: new Date() },
      })

      const contacts = await syncContacts(tx, profile.id)

      await tx.achievement.deleteMany()
      await tx.experience.deleteMany()
      await tx.stackItem.deleteMany()
      await tx.project.deleteMany()
      await tx.skill.deleteMany()
      await tx.skillGroup.deleteMany()
      await tx.metric.deleteMany()
      await tx.languageSkill.deleteMany()
      await tx.education.deleteMany()

      const metrics = await tx.metric.createMany({
        data: content.metrics.map((metric, index) => ({ ...metric, position: index * POSITION_STEP })),
      })

      const experiences = await syncExperiences(tx)
      const projects = await syncProjects(tx)
      const skillGroups = await syncSkillGroups(tx)

      const languages = await tx.languageSkill.createMany({
        data: content.languages.map((language, index) => ({ ...language, position: index * POSITION_STEP })),
      })

      const education = await tx.education.createMany({
        data: content.education.map((entry, index) => ({ ...entry, position: index * POSITION_STEP })),
      })

      return { profile: 1, contacts, metrics: metrics.count, experiences, projects, skillGroups, languages: languages.count, education: education.count }
    })

    console.log(
      'Сид применён:',
      JSON.stringify(
        {
          ...stats,
          phoneContact: process.env.CARD_PHONE_URL ? 'создан как private' : 'нет CARD_PHONE_URL — строки нет',
        },
        null,
        1,
      ),
    )
  } finally {
    await prisma.$disconnect()
  }
}

type Tx = Prisma.TransactionClient

async function syncContacts(tx: Tx, profileId: string): Promise<number> {
  const seeds = [...content.contacts]

  // Телефон появляется в базе только если его явно передали окружением, и всё
  // равно с visibility=private: публичный API его не отдаёт, на страницу он не
  // попадает. Так решение «не светить номер» живёт в данных, а не в догадках.
  if (process.env.CARD_PHONE_URL) {
    seeds.push({ kind: 'phone', label: 'по запросу', url: process.env.CARD_PHONE_URL, visibility: 'private' })
  }

  let count = 0
  for (const [index, contact] of seeds.entries()) {
    const visibility = contact.visibility ?? 'public'
    await tx.contactLink.upsert({
      where: {
        profileId_kind_label: { profileId, kind: contact.kind, label: contact.label },
      },
      create: {
        profileId,
        kind: contact.kind,
        label: contact.label,
        url: contact.url,
        visibility,
        position: index * POSITION_STEP,
      },
      update: { url: contact.url, visibility, position: index * POSITION_STEP },
    })
    count += 1
  }

  const keepLabels = seeds.map((s) => s.label)
  await tx.contactLink.deleteMany({ where: { profileId, label: { notIn: keepLabels } } })

  return count
}

async function syncExperiences(tx: Tx): Promise<number> {
  let created = 0
  for (const [index, experience] of content.experiences.entries()) {
    await tx.experience.create({
      data: {
        slug: experience.slug,
        company: experience.company,
        companyNote: experience.companyNote,
        role: experience.role,
        period: experience.period,
        dateStart: experience.dateStart,
        dateEnd: experience.dateEnd,
        isCurrent: experience.isCurrent ?? false,
        location: experience.location,
        summary: experience.summary,
        position: index * POSITION_STEP,
        achievements: {
          create: experience.achievements.map((achievement, achievementIndex) => ({
            text: achievement.text,
            category: achievement.category,
            featured: achievement.featured ?? false,
            position: achievementIndex * POSITION_STEP,
          })),
        },
      },
    })
    created += 1
  }
  return created
}

async function syncProjects(tx: Tx): Promise<number> {
  let created = 0
  for (const [index, project] of content.projects.entries()) {
    await tx.project.create({
      data: {
        slug: project.slug,
        name: project.name,
        summary: project.summary,
        year: project.year,
        url: project.url,
        position: index * POSITION_STEP,
        stack: {
          create: project.stack.map((name, stackIndex) => ({ name, position: stackIndex * POSITION_STEP })),
        },
      },
    })
    created += 1
  }
  return created
}

async function syncSkillGroups(tx: Tx): Promise<number> {
  let created = 0
  for (const [index, group] of content.skillGroups.entries()) {
    await tx.skillGroup.create({
      data: {
        slug: group.slug,
        name: group.name,
        position: index * POSITION_STEP,
        skills: {
          create: group.skills.map((skill, skillIndex) => ({
            name: skill.name,
            note: skill.note,
            featured: skill.featured ?? false,
            position: skillIndex * POSITION_STEP,
          })),
        },
      },
    })
    created += 1
  }
  return created
}

void main().catch((error: unknown) => {
  console.error('Сид упал:', error)
  process.exitCode = 1
})
