import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserDTO } from "shared/types_generated";
import { Category } from "src/entities/category.entity";
import { Record } from "src/entities/record.entity";
import { History } from 'src/entities/history.entity';
import { TwitterSetting } from "src/entities/twitter_setting.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { CategorySerializer } from "./category.serializer";

export type UserSerializerOptions = {
  categories?: boolean;
  stats?: boolean;
  twitter?: boolean;
};

@Injectable()
export class UserSerializer {
  static legacyOptions({
    includeCategories = true,
    includeStats = false,
  }: {
    includeCategories?: boolean,
    includeStats?: boolean,
  }): UserSerializerOptions {
    return {
      categories: includeCategories,
      stats: includeStats,
      twitter: true,
    }
  }

  constructor(
    private categorySerializer: CategorySerializer,
    @InjectRepository(TwitterSetting) private twitterSettingRepository: Repository<TwitterSetting>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(Record) private recordRepository: Repository<Record>,
    @InjectRepository(History) private historyRepository: Repository<History>,
  ) {
  }

  async serialize(user: User, viewer: User | null = null, options: UserSerializerOptions): Promise<UserDTO> {
    const isViewer = viewer != null && user.id === viewer.id;
    return {
      id: user.id,
      name: user.username,
      date_joined: user.date_joined.getTime(),
      is_twitter_connected: isViewer && options.twitter ? (await this.twitterSettingRepository.findOne({ where: { user } })) != null : null,
      categories: options.categories ? (await this.categoryRepository.find({ where: { user } })).map(it => this.categorySerializer.serialize(it)) : null,
      record_count: options.stats ? await this.recordRepository.count({ where: { user } }) : null,
      history_count: options.stats ? await this.historyRepository.count({ where: { user } }) : null,
    };
  }
}
