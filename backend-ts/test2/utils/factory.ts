import * as cuid from "cuid";
import { Category } from "src/entities/category.entity";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { WorkMetadata } from "src/entities/work_metadata";
import { createCategory } from "src2/services/category";
import { addRecordHistory, createRecord } from "src2/services/record";
import { getOrCreateWork } from "src2/services/work";
import { Period } from "src/utils/period";
import { db } from "src2/database";

export class TestFactoryUtils {
  constructor(
  ) {}

  async newUser(): Promise<User> {
    return await db.save(db.create(User, {
      username: cuid(),
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      is_staff: false,
      is_active: true,
      is_superuser: false,
      last_login: new Date(),
      date_joined: new Date(),
    }))
  }

  async newCategory({
    user,
    name
  }: {
    user: User;
    name?: string;
  }): Promise<Category> {
    return createCategory(user, {
      name: name ?? cuid()
    })
  }

  async newWork({
    periods,
    metadata,
  }: {
    periods?: Period[];
    metadata?: Partial<WorkMetadata>;
  } = {}): Promise<Work> {
    const work = await getOrCreateWork(cuid())
    work.metadata = {
      version: 2,
      ...periods ? { periods: periods.map(it => it.toString()) } : {},
      ...metadata ?? {},
    }
    if (periods)
      work.first_period = periods[0].toString()
    await db.save(work)
    return work
  }

  async newRecord({
    user,
    work,
    category,
    comment,
    status,
    statusType,
  }: {
    user?: User,
    work?: Work,
    category?: Category,
    comment?: string,
    status?: string,
    statusType?: StatusType,
  } = {}): Promise<{ record: Record, history: History }> {
    if (!user) user = await this.newUser()
    if (!work) work = await this.newWork()
    const {record, history} = await createRecord(user, work, {
      title: work.title,
      status: status ?? '1',
      statusType: statusType ?? StatusType.FINISHED,
      comment: comment ?? '',
      categoryId: category?.id ?? null,
      rating: null,
    })
    return { record, history }
  }

  async newHistory({
    user,
    work,
    record,
    comment,
  }: {
    user?: User,
    work?: Work,
    record?: Record,
    comment?: string,
  } = {}): Promise<History> {
    if (!record) record = (await this.newRecord({ user, work, comment })).record
    return addRecordHistory(record, {
      status: record.status,
      statusType: record.status_type,
      comment: comment ?? '',
      containsSpoiler: false,
      rating: null,
    })
  }

  async deleteAllRecords() {
    await db.delete(History, {})
    await db.delete(Record, {})
    // TODO: update WorkIndex
  }

  async deleteAllWorks() {
    await this.deleteAllRecords() // hmm...
    await db.delete(TitleMapping, {})
    await db.delete(WorkIndex, {})
    await db.delete(Work, {})
  }
}
