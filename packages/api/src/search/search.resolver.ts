import { Args, Query, Resolver } from '@nestjs/graphql'
import type { SearchResult } from '@card/contracts'
import { SearchArgs, SearchResultType } from '../graphql/models/search.model.js'
import { SearchService } from './search.service.js'

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => SearchResultType, {
    name: 'search',
    description: 'Поиск по featured-буллетам, проектам, навыкам и местам работы.',
  })
  search(@Args() args: SearchArgs): Promise<SearchResult> {
    return this.searchService.search(args.query, args.limit)
  }
}
