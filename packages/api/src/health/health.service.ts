import { Injectable } from '@nestjs/common'
import type { Health } from '@card/contracts'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Базу пробует настоящим count(): контейнер может стартовать с применённой
   * миграцией, но пустой базой, и «клиент создан» про это не скажет ничего.
   * Отсюда `records` в ответе и статус degraded, когда содержимого нет.
   */
  async check(): Promise<Health> {
    let databaseConnected = false
    let records = 0

    try {
      const counts = await Promise.all([
        this.prisma.profile.count(),
        this.prisma.metric.count(),
        this.prisma.experience.count(),
        this.prisma.achievement.count(),
        this.prisma.project.count(),
        this.prisma.skillGroup.count(),
        this.prisma.skill.count(),
        this.prisma.contactLink.count(),
        this.prisma.languageSkill.count(),
        this.prisma.education.count(),
      ])
      records = counts.reduce((sum, count) => sum + count, 0)
      databaseConnected = true
    } catch {
      databaseConnected = false
    }

    return {
      status: databaseConnected && records > 0 ? 'ok' : 'degraded',
      version: process.env.CARD_APP_VERSION ?? '1.0.0',
      uptimeSeconds: Math.round(process.uptime()),
      databaseConnected,
      records,
    }
  }
}
