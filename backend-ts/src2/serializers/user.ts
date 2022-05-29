import { Category } from "src/entities/category.entity";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { TwitterSetting } from "src/entities/twitter_setting.entity";
import { User } from "src/entities/user.entity";
import { db } from "src2/database";
import { UserDto } from "src2/schemas/user";
import { serializeCategory } from "./category";

export type UserSerializerOptions = {
  categories?: boolean;
  stats?: boolean;
  twitter?: boolean;
};

export async function serializeUser(user: User, viewer: User | null = null, options: UserSerializerOptions): Promise<UserDto> {
  const isViewer = viewer != null && user.id === viewer.id;
  return {
    id: user.id.toString(),
    name: user.username,
    dateJoined: user.date_joined.getTime(),
    isTwitterConnected: isViewer && options.twitter ? (await db.findOne(TwitterSetting, { where: { user } })) != null : null,
    categories: options.categories ? (await db.find(Category, { where: { user }, order: {position: 'ASC'} })).map(it => serializeCategory(it)) : null,
    recordCount: options.stats ? await db.count(Record, { where: { user } }) : null,
    historyCount: options.stats ? await db.count(History, { where: { user } }) : null,
  }
}
