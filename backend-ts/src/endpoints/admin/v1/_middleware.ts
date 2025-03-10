import { FastifyReply, FastifyRequest } from "fastify";
import { ApiException } from "src/exceptions";
import { getCurrentUser, requireInternalApiKey } from "src/auth";

export default async function(request: FastifyRequest, reply: FastifyReply) {
  const user = await getCurrentUser(request)
  if (!user) {
    requireInternalApiKey(request)
  } else if (!user?.is_staff) {
    throw new ApiException("Staff permission required.", 401)
  } else {
    // ok
  }
}
