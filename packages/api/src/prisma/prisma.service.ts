import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '../generated/prisma/client.js'
import { readEnv } from '../config/env.js'

/**
 * Prisma 7 не берёт url из schema.prisma: соединение приходит адаптером.
 * better-sqlite3 — синхронный драйвер, поэтому миграции и сид можно гонять
 * тем же DATABASE_URL, что и рантайм, без отдельного shadow-конфига.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const { DATABASE_URL } = readEnv()
    super({ adapter: new PrismaBetterSqlite3({ url: DATABASE_URL }) })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
