import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import fastifyStatic from '@fastify/static'

const NEXT_ASSET_PREFIX = '_next/static'

/**
 * Next собран со `output: 'export'`, поэтому отдельного Node-процесса для
 * фронтенда нет: NestJS поднимает GraphQL и раздаёт статику из одного
 * контейнера на одном порту. За счёт этого визитка и её API живут на одном
 * origin, и браузеру не нужен CORS ни для запроса страницы, ни для запроса данных.
 *
 * Плагин регистрирует GET /* — он отдаёт и index.html на /, и hashed-ассеты
 * /_next/*. Конкретные маршруты Fastify важнее wildcard, поэтому /graphql и
 * /healthz продолжают принадлежать Nest.
 *
 * Свой setNotFoundHandler здесь сознательно нет: Nest вешает собственный на
 * этапе init(), и вторая попытка уронить процесс при старте уже была
 * проверена экспериментом.
 */
export async function registerStaticAssets(app: NestFastifyApplication, staticDir: string): Promise<boolean> {
  const root = resolve(staticDir)
  if (!existsSync(join(root, 'index.html'))) {
    return false
  }

  const instance = app.getHttpAdapter().getInstance()

  await instance.register(fastifyStatic, {
    root,
    index: ['index.html'],
    setHeaders(reply, path) {
      if (path.includes(NEXT_ASSET_PREFIX)) {
        reply.header('cache-control', 'public, max-age=31536000, immutable')
        return
      }
      reply.header('cache-control', 'public, max-age=0, must-revalidate')
    },
  })

  return true
}
