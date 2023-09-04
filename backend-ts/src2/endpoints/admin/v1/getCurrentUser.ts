import { ApiException } from "src/controllers/exceptions";
import { serializeUser } from 'src2/serializers/user';
import { UserDto } from 'src2/schemas/user';
import { getCurrentUser } from "src2/auth";
import { FastifyRequest } from "fastify";

export default async function (params: {}, request: FastifyRequest): Promise<UserDto> {
  const currentUser = await getCurrentUser(request)
  if (!currentUser) throw new ApiException('Not logged in', 403)
  return serializeUser(currentUser, currentUser, {})
}
