import { QueryResolvers } from "src/graphql/generated"
import { History } from "src/entities/history.entity"
import { db } from "src2/database"
import { LessThan, Not } from "typeorm"
import { getWorkIndex } from "src2/services/work"
import { PostId } from "../id"

export const timeline: QueryResolvers['timeline'] = async (_, { beforeId, count }) => {
  const limit = Math.min(count ?? 32, 128)
  const minRecordCount = 2
  let posts: History[]
  if (minRecordCount != null) {
    const filteredPosts: History[] = []
    let batchBeforeId = beforeId != null ? PostId.toDatabaseId(beforeId) : null
    let queryCount = 0
    while (filteredPosts.length < limit && queryCount < 5) {
      const maxBatchSize = Math.max(32, limit - filteredPosts.length)
      const batch = await db.find(History, {
        relations: ['user', 'record'],
        where: {
          comment: Not(''),
          ...batchBeforeId ? { id: LessThan(batchBeforeId) } : {},
        },
        order: {
          id: 'DESC',
        },
        take: maxBatchSize,
      })
      queryCount++
      const workIndexes = await Promise.all(batch.map(it => getWorkIndex(it.work_id)))
      const filteredBatch = batch.filter(history => {
        const recordCount = workIndexes.find(it => history.work_id === it?.work_id)?.record_count ?? 0
        return recordCount >= minRecordCount
      })
      filteredPosts.push(...filteredBatch)
      batchBeforeId = batch[batch.length - 1]?.id
      if (batch.length < maxBatchSize) {
        // no more posts to find
        break
      }
    }
    posts = filteredPosts
  } else {
    posts = await db.find(History, {
      relations: ['user', 'record'],
      where: {
        comment: Not(''),
        ...beforeId ? { id: LessThan(beforeId) } : {},
      },
      order: {
        id: 'DESC',
      },
      take: limit,
    })
  }
  return posts
}
