import { resolve } from 'node:path'
import { Module } from '@nestjs/common'
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { GraphQLModule } from '@nestjs/graphql'
import { readEnv } from './config/env.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { CardModule } from './card/card.module.js'
import { SearchModule } from './search/search.module.js'
import { HealthModule } from './health/health.module.js'

const env = readEnv()

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Code-first: SDL — производное, он перегенерируется при старте и
      // закоммичен в schema.graphql, чтобы ревьюер видел контракт без запуска.
      autoSchemaFile: resolve(process.cwd(), 'schema.graphql'),
      sortSchema: true,
      playground: env.GRAPHIQL,
    }),
    PrismaModule,
    CardModule,
    SearchModule,
    HealthModule,
  ],
})
export class AppModule {}
