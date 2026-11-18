import type { AchievementCategory, ContactKind, LanguageLevel } from '@card/contracts'

export const LANGUAGE_LEVEL_LABELS: Record<LanguageLevel, string> = {
  native: 'Родной',
  b2: 'B2 — Upper-Intermediate',
  b1: 'B1 — Intermediate',
  a2: 'A2 — Elementary',
  a1: 'A1 — Beginner',
}

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  backend: 'бэкенд',
  frontend: 'фронтенд',
  mobile: 'мобильное',
  quality: 'качество',
  infra: 'инфраструктура',
  analytics: 'аналитика',
}

export const CONTACT_LABELS: Record<ContactKind, string> = {
  telegram: 'Telegram',
  github: 'GitHub',
  email: 'Почта',
  phone: 'Телефон',
  website: 'Сайт',
  other: 'Другое',
}

export const ERROR_HINTS: Record<string, string> = {
  network: 'API не отвечает. Проверьте, что сервер запущен: pnpm start в корне проекта.',
  http: 'Сервер ответил ошибкой транспорта. Запрос можно повторить.',
  graphql: 'GraphQL вернул ошибку исполнения — подробнее в сообщении ниже.',
  contract: 'Ответ не совпал с контрактом @card/contracts: схема и сервер разошлись.',
}

export function formatPeriod(start: string | null, end: string | null, isCurrent: boolean): string {
  if (isCurrent) {
    return `${start ?? ''} — сейчас`
  }
  if (start && end) {
    return `${start} — ${end}`
  }
  return start ?? end ?? ''
}
