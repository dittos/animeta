import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { db } from "src/database";
import { In, LessThan, Not } from "typeorm";

export function getPost(id: number): Promise<History | undefined> {
  // TODO: dataloader
  return db.findOne(History, id)
}

// 이게 여기있는게 맞나...
export async function getWorkPosts(work: Work, { beforeId, count, episode }: {
  beforeId?: number | null;
  count?: number | null;
  episode?: number | null;
}) {
  count = Math.min(count ?? 32, 128)
  const nodes = await db.find(History, {
    where: {
      work_id: work.id,
      comment: Not(''),
      ...beforeId ? { id: LessThan(beforeId) } : {},
      ...episode ? { status: In([episode, '0' + episode]) } : {},
    },
    order: { id: 'DESC' },
    take: count + 1,
  })
  return {
    nodes: nodes.slice(0, count),
    hasMore: nodes.length > count,
  }
}

// 이게 여기있는게 맞나...
export async function getUserPosts(user: User, { beforeId, count }: {
  beforeId?: number | null;
  count?: number | null;
}) {
  count = Math.min(count ?? 32, 128)
  const nodes = await db.find(History, {
    where: {
      user,
      ...beforeId ? { id: LessThan(beforeId) } : {},
    },
    order: { id: 'DESC' },
    take: count + 1,
  })
  return {
    nodes: nodes.slice(0, count),
    hasMore: nodes.length > count,
  }
}

// 이게 여기있는게 맞나...
export async function getRecordPosts(record: Record, { beforeId, count }: {
  beforeId?: number | null;
  count?: number | null;
}) {
  const nodes = await db.find(History, {
    where: {
      record,
      ...beforeId ? { id: LessThan(beforeId) } : {},
    },
    order: { id: 'DESC' },
    ...count ? { take: count + 1 } : {},
  })
  return {
    nodes: count ? nodes.slice(0, count) : nodes,
    hasMore: count ? nodes.length > count : false,
  }
}
