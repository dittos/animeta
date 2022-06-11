import * as DataLoader from "dataloader";
import { Record } from "src/entities/record.entity";
import { objResults } from "src/utils/dataloader";
import { db } from "src2/database";

const dataLoader = new DataLoader<number, Record>(
  objResults(ids => db.findByIds(Record, Array.from(ids)), k => `${k}`, v => `${v.id}`),
  { cache: false }
)

export async function getRecord(id: number): Promise<Record> {
  return dataLoader.load(id);
}