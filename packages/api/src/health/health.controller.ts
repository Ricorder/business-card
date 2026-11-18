import { Controller, Get } from '@nestjs/common'
import type { Health } from '@card/contracts'
import { HealthService } from './health.service.js'

/**
 * Тот же ответ, что и GraphQL-запрос `health`, но без разбора запроса —
 * удобнее для healthcheck-а контейнера и для мониторинга Fly.
 */
@Controller('healthz')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  check(): Promise<Health> {
    return this.health.check()
  }
}
