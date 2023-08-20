import { HttpStatus } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { ApiException } from "src/controllers/exceptions";
import { requireUser } from "src2/auth";
import { changePassword, checkPassword } from "src2/services/auth";

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
    throw new ApiException('기존 암호를 확인해주세요.', HttpStatus.FORBIDDEN)
  await changePassword(currentUser, params.newPassword)
  return {ok: true}
}
