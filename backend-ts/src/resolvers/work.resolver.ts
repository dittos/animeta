import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'
import { GqlCurrentUser } from 'src/auth/decorators';
import { Record } from 'src/entities/record.entity';
import { User } from 'src/entities/user.entity';
import { Work } from 'src/entities/work.entity';
import { RecordService } from 'src/services/record.service';
import { SearchService } from 'src/services/search.service';
import { WorkService } from 'src/services/work.service';

@Resolver('Work')
export class WorkResolver {
  constructor(
    private recordService: RecordService,
    private searchService: SearchService,
    private workService: WorkService,
  ) {}

  // @Query('userByName')
  // async userByName(@Args('name') name: string) {
  //   return this.userRepository.findOne({ where: {username: name} })
  // }

  @ResolveField('imageUrl')
  imageUrl(@Parent() work: Work): string {
    // TODO: config
    return work.image_filename ? `https://storage.googleapis.com/animeta-static/media/${work.image_filename}` : null
  }

  @ResolveField('record')
  async record(@Parent() work: Work, @GqlCurrentUser({ required: false }) currentUser: User | null): Promise<Record | null> {
    if (!currentUser) {
      return null
    }
    return this.recordService.findByUserAndWork(currentUser, work);
  }

  @ResolveField('recordCount')
  async recordCount(@Parent() work: Work): Promise<number> {
    return (await this.workService.getIndex(work.id))?.record_count
  }

  @Query()
  async searchWorks(@Args('query') query: string): Promise<{ edges: { node: Work, recordCount: number }[] }> {
    const result = await this.searchService.search(query, 30);
    const edges = await Promise.all(result.map(it => this.workService.get(it.id).then(work => ({
      node: work,
      recordCount: it.recordCount,
    }))));
    return { edges };
  }
}
