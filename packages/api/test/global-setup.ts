import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

/**
 * E2E-тесты идут по настоящей цепочке: migrate deploy -> db seed -> приложение.
 * Фикстура лежит в изолированном файле, чтобы прогон тестов не трогал локальную
 * базу разработки и не зависел от её состояния.
 */
export const TEST_DB_PATH = join(process.cwd(), '.test-db', 'card.db')
export const TEST_DATABASE_URL = `file:${TEST_DB_PATH}`

export default async function globalSetup(): Promise<void> {
  if (!existsSync(join(process.cwd(), 'prisma', 'migrations'))) {
    throw new Error('Нет prisma/migrations — тестовая база нечем наполнять')
  }

  rmSync(join(process.cwd(), '.test-db'), { recursive: true, force: true })
  mkdirSync(join(process.cwd(), '.test-db'), { recursive: true })

  const env = { ...process.env, DATABASE_URL: TEST_DATABASE_URL }

  execFileSync('npx', ['prisma', 'generate'], { cwd: process.cwd(), env, stdio: 'pipe' })
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], { cwd: process.cwd(), env, stdio: 'pipe' })
  // Сид запускаем tsx напрямую, а не через `prisma db seed`: в Prisma 7 способ
  // объявить seed-команду отличается от того, что было в шестой версии, и
  // тестам не стоит от него зависеть.
  execFileSync('npx', ['tsx', 'prisma/seed.ts'], { cwd: process.cwd(), env, stdio: 'pipe' })

  process.env.DATABASE_URL = TEST_DATABASE_URL
  process.env.STATIC_DIR = process.env.STATIC_DIR ?? ''
  process.env.GRAPHIQL = 'false'
  process.env.CARD_APP_VERSION = 'test'
}
