import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm';
import { GqlCurrentUser } from 'src/auth/decorators';
import { Category } from 'src/entities/category.entity';
import { History } from 'src/entities/history.entity';
import { Record } from 'src/entities/record.entity';
import { TwitterSetting } from 'src/entities/twitter_setting.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Resolver('User')
export class UserResolver {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(TwitterSetting) private twitterSettingRepository: Repository<TwitterSetting>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(Record) private recordRepository: Repository<Record>,
    @InjectRepository(History) private historyRepository: Repository<History>,
  ) {}

  @Query('currentUser')
  async currentUser(@GqlCurrentUser() currentUser: User) {
    return currentUser
  }

  @Query('userByName')
  async userByName(@Args('name') name: string) {
    return this.userRepository.findOne({ where: {username: name} })
  }

  @ResolveField('name')
  name(@Parent() user: User): string {
    return user.username
  }

  @ResolveField('joinedAt')
  joinedAt(@Parent() user: User): Date {
    return user.date_joined
  }

  @ResolveField('isTwitterConnected')
  async isTwitterConnected(@Parent() user: User, @GqlCurrentUser({ required: false }) currentUser: User): Promise<boolean | null> {
    if (user.id !== currentUser.id) {
      return null
    }
    return (await this.twitterSettingRepository.findOne({ where: { user } })) != null
  }

  @ResolveField('categories')
  async categories(@Parent() user: User): Promise<Category[]> {
    return this.categoryRepository.find({ where: { user } })
  }

  @ResolveField('recordCount')
  async recordCount(@Parent() user: User): Promise<number> {
    return this.recordRepository.count({ where: { user } })
  }

  @ResolveField('postCount')
  async postCount(@Parent() user: User): Promise<number> {
    return this.historyRepository.count({ where: { user } })
  }
}
