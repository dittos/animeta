import { ApiException } from "src/exceptions";
import { serializeUser } from 'src/serializers/user';
import { UserDto } from 'src/schemas/user';
import { getCurrentUser } from "src/auth";
import { FastifyRequest } from "fastify";

export default async function (params: {}, request: FastifyRequest): Promise<UserDto> {
  const currentUser = await getCurrentUser(request)
  if (!currentUser) throw new ApiException('Not logged in', 403)
  return serializeUser(currentUser, currentUser, {})
}
