import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('127.0.0.1'),
  DATABASE_URL: z.string().min(1),
  /** Каталог со статикой Next-экспорта. Если не задан — API работает без раздачи фронта. */
  STATIC_DIR: z.string().optional(),
  /** GraphiQL на GET /graphql. По умолчанию включён: это часть демонстрации задания. */
  GRAPHIQL: z
    .enum(['true', 'false', '1', '0'])
    .default('true')
    .transform((v) => v === 'true' || v === '1'),
  CARD_APP_VERSION: z.string().default('1.0.0'),
})

export type AppEnv = z.infer<typeof envSchema>

export function readEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = envSchema.safeParse(source)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n')
    throw new Error(`Несовместимое окружение API:\n${issues}`)
  }
  return parsed.data
}
