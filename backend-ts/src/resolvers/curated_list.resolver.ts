import { Resolver, Query, Args, ResolveField, Parent, Context } from '@nestjs/graphql'
import { GqlCurrentUser } from 'src/auth/decorators';
import { User } from 'src/entities/user.entity';
import { CuratedListMetadata, CuratedListService } from 'src/services/curated_list.service';

@Resolver('CuratedList')
export class CuratedListResolver {
  constructor(
    private curatedListService: CuratedListService,
  ) {}

  @Query('curatedLists')
  async curatedLists(@GqlCurrentUser({ required: false }) currentUser: User) {
    return this.curatedListService.getAllLists()
  }

  @Query('curatedList')
  async curatedList(@Args('id') id: string) {
    return this.curatedListService.getList(id)
  }

  @ResolveField('works')
  async works(@Parent() parent: CuratedListMetadata, @GqlCurrentUser() currentUser: User) {
    const { notAddedWorks, totalCount } = await this.curatedListService.getWorks(parent, currentUser)
    return {
      edges: notAddedWorks.map(node => ({ node })),
      totalCount,
    }
  }
}
