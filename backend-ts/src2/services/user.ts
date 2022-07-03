import * as DataLoader from "dataloader";
import { User } from "src/entities/user.entity";
import { objResults } from "src/utils/dataloader";
import { db } from "src2/database";

const dataLoader = new DataLoader<number, User>(
  objResults(ids => db.findByIds(User, Array.from(ids)), k => `${k}`, v => `${v.id}`),
  { cache: false }
)

export function getUser(id: number): Promise<User> {
  return dataLoader.load(id)
}

export function getUserByName(name: string): Promise<User | undefined> {
  return db.findOne(User, { where: { username: name } })
}
