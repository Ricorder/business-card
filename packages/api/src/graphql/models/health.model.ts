import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType('Health', { description: 'Состояние сервиса: используется healthcheck-ом контейнера.' })
export class HealthType {
  @Field()
  status!: string

  @Field()
  version!: string

  @Field(() => Int)
  uptimeSeconds!: number

  @Field({ description: 'Пробуется реальным запросом к SQLite, а не просто конструктором клиента.' })
  databaseConnected!: boolean

  @Field(() => Int, { description: 'Суммарное число строк содержимого: ловит «миграция применена, база пуста».' })
  records!: number
}
