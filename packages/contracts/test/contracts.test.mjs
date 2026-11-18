import assert from 'node:assert/strict'
import test from 'node:test'
import {
  achievementCategorySchema,
  cardSchema,
  contactKindSchema,
  searchResultSchema,
  visibilitySchema,
} from '../dist/index.js'

test('union-значения перечислений совпадают с ожиданиями API', () => {
  assert.deepEqual(contactKindSchema.options, ['telegram', 'github', 'email', 'phone', 'website', 'other'])
  assert.deepEqual(visibilitySchema.options, ['public', 'private'])
  assert.equal(achievementCategorySchema.safeParse('backend').success, true)
  assert.equal(achievementCategorySchema.safeParse('devops').success, false)
})

const minimalCard = (links) => ({
  profile: {
    id: 'p1',
    handle: 'x',
    displayName: 'Иван',
    title: 'Fullstack',
    tagline: '…',
    location: 'Москва',
    summary: '…',
    timezone: null,
    updatedAt: '2026-11-18T00:00:00.000Z',
  },
  metrics: [],
  experiences: [],
  skillGroups: [],
  links,
  languages: [],
})

test('cardSchema ловит контакт с неизвестным kind и не пропускает приватный наружу', () => {
  const broken = minimalCard([{ id: 'l1', kind: 'whatsapp', label: 'wa', url: 'https://wa.me/1', position: 0 }])
  assert.equal(cardSchema.safeParse(broken).success, false)

  // visibility — поле базы, в публичном GraphQL-ответе его нет: приватную
  // ссылку нельзя случайно протащить, добавив её в выборку сервиса.
  const leaked = minimalCard([
    { id: 'l2', kind: 'phone', label: '+7…', url: 'tel:7', position: 0, visibility: 'private' },
  ])
  const parsed = cardSchema.safeParse(leaked)
  assert.equal(parsed.success, true)
  assert.deepEqual(Object.keys(parsed.data.links[0]).sort(), ['id', 'kind', 'label', 'position', 'url'])
})

test('searchResultSchema требует total и kind находки', () => {
  assert.equal(searchResultSchema.safeParse({ query: 'q', total: 0, hits: [] }).success, true)
  assert.equal(
    searchResultSchema.safeParse({
      query: 'q',
      total: 1,
      hits: [{ id: 'a', kind: 'unknown', title: 't', text: 'x', company: null }],
    }).success,
    false,
  )
})
