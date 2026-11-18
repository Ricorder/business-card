import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql'
import { SearchHitKind } from '../enums.js'

@ObjectType('SearchHit', { description: 'Находка поиска по содержимому визитки.' })
export class SearchHitType {
  @Field()
  id!: string

  @Field(() => SearchHitKind)
  kind!: SearchHitKind

  @Field()
  title!: string

  @Field()
  text!: string

  @Field(() => String, { nullable: true })
  company?: string | null
}

@ObjectType('SearchResult', { description: 'Ответ поиска: запрос, общее число совпадений и срез.' })
export class SearchResultType {
  @Field({ description: 'То, что искалось — возврат для отладки запроса из GraphiQL.' })
  query!: string

  @Field(() => Int)
  total!: number

  @Field(() => [SearchHitType])
  hits!: SearchHitType[]
}

/**
 * Граница системы, поэтому проверяется явно, а не через class-validator:
 * лишние зависимости этому сервису не нужны, а правило должно быть видно
 * рядом с запросом к базе.
 */
@ArgsType()
export class SearchArgs {
  @Field(() => String, { description: 'Подстрока поиска по буллетам, проектам, навыкам и местам работы. От 2 до 64 символов.' })
  query!: string

  @Field(() => Int, { nullable: true, defaultValue: 20, description: 'Сколько находок вернуть, максимум 100.' })
  limit?: number | null
}
