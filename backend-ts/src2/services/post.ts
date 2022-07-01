import { History } from "src/entities/history.entity";
import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { LessThan, Not } from "typeorm";

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
      ...episode ? { status: episode } : {},
    },
    order: { id: 'DESC' },
    take: count + 1,
  })
  return {
    nodes: nodes.slice(0, count),
    hasMore: nodes.length > count,
  }
}
