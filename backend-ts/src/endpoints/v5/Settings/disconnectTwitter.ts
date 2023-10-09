import { FastifyRequest } from "fastify";
import { requireUser } from "src/auth";
import { removeOAuthAuthorization } from "src/services/twitter";

export default async function (params: {}, request: FastifyRequest): Promise<{ok: boolean}> {
  const currentUser = await requireUser(request)
  await removeOAuthAuthorization(currentUser)
  return {ok: true}
}
