import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm';
import { GqlCurrentUser } from 'src/auth/decorators';
import { Record } from 'src/entities/record.entity';
import { StatusType } from 'src/entities/status_type';
import { User } from 'src/entities/user.entity';
import { Work } from 'src/entities/work.entity';
import { Repository } from 'typeorm';

@Resolver('Record')
export class RecordResolver {
  constructor(
    @InjectRepository(Work) private workRepository: Repository<Work>,
    @InjectRepository(Record) private recordRepository: Repository<Record>,
  ) {}

  // @Query('userByName')
  // async userByName(@Args('name') name: string) {
  //   return this.userRepository.findOne({ where: {username: name} })
  // }

  @ResolveField('statusType')
  statusType(@Parent() record: Record): string {
    return StatusType[record.status_type]
  }
}
