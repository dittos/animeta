import { FastifyRequest } from "fastify";
import { ApiException } from "src/controllers/exceptions";
import { User } from "src/entities/user.entity";
import { getCurrentUser } from "src2/auth";
import { db } from "src2/database";
import { getUnratedRecordCount } from "src2/services/record";

type RatingSummary = {
  rating: number;
  recordCount: number;
}

async function getRatingSummaries(user: User): Promise<RatingSummary[]> {
  const ratingsWithCount: {rating: number; n: string}[] = await db.query(`
    SELECT rating, COUNT(*) AS n
    FROM record_record
    WHERE user_id = $1 AND rating IS NOT NULL
    GROUP BY rating
  `, [user.id])
  return ratingsWithCount.map(it => {
    return {
      rating: it.rating,
      recordCount: Number(it.n),
    }
  })
}

export default async function(params: {}, request: FastifyRequest): Promise<{
  ratingSummaries: RatingSummary[];
  unratedRecordCount: number;
}> {
  const currentUser = await getCurrentUser(request)
  if (!currentUser) throw new ApiException('Not logged in', 403)
  return {
    ratingSummaries: await getRatingSummaries(currentUser),
    unratedRecordCount: await getUnratedRecordCount(currentUser),
  }
}
