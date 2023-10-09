import { History } from "src/entities/history.entity";
import { StatusType } from "src/entities/status_type";
import { EpisodeResolvers } from "src/graphql/generated";
import { db } from "src/database";

export const Episode: EpisodeResolvers = {
  userCount: async (episode) => {
    const result = await db.createQueryBuilder()
      .from(History, 'h')
      .select('COUNT(DISTINCT user_id)', 'count')
      .where('work_id = :workId AND status = :status', { workId: episode.workId, status: episode.number })
      .getRawOne()
    return Number(result.count)
  },
  suspendedUserCount: async (episode) => {
    const result = await db.createQueryBuilder()
      .from(History, 'h')
      .select('COUNT(DISTINCT user_id)', 'count')
      .where('work_id = :workId AND status = :status AND status_type = :statusType',
        { workId: episode.workId, status: episode.number, statusType: StatusType.SUSPENDED })
      .getRawOne()
    return Number(result.count)
  },
}
