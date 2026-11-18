import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { AppModule } from './app.module.js'
import { readEnv } from './config/env.js'
import { registerStaticAssets } from './static/static-assets.js'

async function bootstrap(): Promise<void> {
  const env = readEnv()
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: false,
  })

  // Данные визитки публичные и только на чтение: открытый CORS позволяет
  // любому собрать свою вкладку поверх этого GraphQL и проверить контракт
  // запросом, а не догадываться о нём по README.
  app.enableCors({ origin: true, methods: ['GET', 'POST', 'OPTIONS'] })
  app.enableShutdownHooks()

  const assetsServed = await registerStaticAssets(app, env.STATIC_DIR ?? '../web/out')

  await app.listen(env.PORT, env.HOST)

  const url = `http://${env.HOST}:${env.PORT}`
  logger.log(`GraphQL: ${url}/graphql${env.GRAPHIQL ? ' (GraphiQL на GET)' : ''}`)
  logger.log(`healthz: ${url}/healthz`)
  logger.log(assetsServed ? `статика визитки: ${url}/` : 'статика не найдена — работает только API')
}

void bootstrap()
