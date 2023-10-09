import { FastifyRequest } from "fastify";
import { ApiException } from "src/exceptions";
import { requireUser } from "src/auth";
import { changePassword, checkPassword } from "src/services/auth";

type Params = {
  oldPassword: string;
  newPassword: string;
};

type Result = {
  ok: boolean;
};

export default async function (params: Params, request: FastifyRequest): Promise<Result> {
  const currentUser = await requireUser(request)
  if (!await checkPassword(currentUser, params.oldPassword))
    throw new ApiException('기존 암호를 확인해주세요.', 403)
  await changePassword(currentUser, params.newPassword)
  return {ok: true}
}
