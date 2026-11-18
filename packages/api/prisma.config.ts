import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { defineConfig } from 'prisma/config'

// Prisma 7 не читает .env сам и не держит url в schema.prisma. В контейнере и
// на Fly DATABASE_URL приходит из окружения, .env нужен только локальной
// разработке — поэтому он опционален, а не обязателен.
if (existsSync('.env')) {
  loadEnvFile('.env')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:../../var/card.db',
  },
})
