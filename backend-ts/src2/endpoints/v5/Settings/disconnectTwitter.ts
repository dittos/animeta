import { FastifyRequest } from "fastify";
import { requireUser } from "src2/auth";
import { removeOAuthAuthorization } from "src2/services/twitter";

export default async function (params: {}, request: FastifyRequest): Promise<{ok: boolean}> {
  const currentUser = await requireUser(request)
  await removeOAuthAuthorization(currentUser)
  return {ok: true}
}
