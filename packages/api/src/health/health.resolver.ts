import { Query, Resolver } from '@nestjs/graphql'
import { HealthType } from '../graphql/models/health.model.js'
import { HealthService } from './health.service.js'
import type { Health } from '@card/contracts'

@Resolver(() => HealthType)
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => HealthType, { description: 'Живое состояние сервиса и содержимого базы.' })
  health(): Promise<Health> {
    return this.healthService.check()
  }
}
