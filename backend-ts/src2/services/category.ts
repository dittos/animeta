import * as DataLoader from "dataloader";
import { Category } from "src/entities/category.entity";
import { objResults } from "src/utils/dataloader";
import { db } from "src2/database";

const dataLoader = new DataLoader<number, Category>(
  objResults(ids => db.findByIds(Category, Array.from(ids)), k => `${k}`, v => `${v.id}`),
  { cache: false }
);

export async function getCategory(id: number): Promise<Category> {
  return dataLoader.load(id)
}
