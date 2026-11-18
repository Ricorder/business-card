import { content } from '../src/seed/content.js'

/**
 * Проверки не про код, а про данные визитки: они держат обещания, которые
 * страница даёт рекрутеру, и ловят опечатку в содержимом до выкатки.
 */
describe('содержимое визитки (prisma/content.ts)', () => {
  it('на витрине не больше четырёх фактов на место работы', () => {
    for (const experience of content.experiences) {
      const featured = experience.achievements.filter((achievement) => achievement.featured)
      expect(featured.length).toBeLessThanOrEqual(4)
      expect(featured.length).toBeGreaterThan(0)
    }
  })

  it('slug уникальны и не пересекаются между сущностями разного рода', () => {
    const slugs = [...content.experiences, ...content.projects, ...content.skillGroups].map((entity) => entity.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('каждый проект называет стек отдельными элементами, а не строкой через запятую', () => {
    for (const project of content.projects) {
      expect(project.stack.length).toBeGreaterThanOrEqual(3)
      expect(project.stack).toEqual(project.stack.map((technology) => technology.trim()))
    }
  })

  it('в каждой группе навыков есть хотя бы один витринный навык', () => {
    for (const group of content.skillGroups) {
      expect(group.skills.some((skill) => skill.featured)).toBe(true)
    }
  })

  it('телефона нет среди контактов, которые пойдут в публичный API', () => {
    // Номер появляется строкой только если его передадут окружением CARD_PHONE_URL,
    // и тогда с visibility=private. В самом содержимом его быть не может.
    expect(content.contacts.some((contact) => contact.kind === 'phone')).toBe(false)
    expect(content.contacts.every((contact) => contact.visibility === 'public')).toBe(true)
  })

  it('метрики — ровно три цифры, как обещает макет', () => {
    expect(content.metrics).toHaveLength(3)
    for (const metric of content.metrics) {
      expect(metric.detail?.trim().length).toBeGreaterThan(0)
    }
  })

  it('категории буллетов взяты из контракта, а не придуманы на месте', async () => {
    const { achievementCategorySchema } = await import('@card/contracts')
    const categories = content.experiences.flatMap((experience) => experience.achievements.map((a) => a.category))

    for (const category of categories) {
      expect(achievementCategorySchema.safeParse(category).success).toBe(true)
    }
    expect(new Set(categories).size).toBeGreaterThan(2)
  })

  it('опыт перечислен от нового к старому, а текущее место ровно одно', () => {
    const current = content.experiences.filter((experience) => experience.isCurrent)
    expect(current).toHaveLength(1)
    expect(content.experiences[0]?.isCurrent).toBe(true)
  })
})
